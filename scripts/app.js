import { algorithms, getAlgorithm, defaultConfig } from "./algorithms/catalog.js";
import { AppError, normalizeError, formatDiagnostic } from "./core/errors.js";
import { installGlobalErrorLogging, logActionSelection, logAlgorithmSelection, logAppReady, logValidationFailure } from "./core/logger.js";
import { loadSetting, saveSetting } from "./core/storage.js";
import { validateConfig } from "./core/validation.js";
import { runAlgorithm } from "./core/runner.js";
import { renderAlgorithmNav, renderMobilePicker } from "./ui/algorithm-picker.js";
import { renderActions, renderConfigForm } from "./ui/config-form.js";
import { hideError, setResultState, showError } from "./ui/result-panel.js";
import { setupTheme } from "./ui/theme.js";

const $ = (selector) => document.querySelector(selector);
const elements = {
  theme: $("#themeSelect"), search: $("#algorithmSearch"), nav: $("#algorithmNav"), navEmpty: $("#algorithmEmpty"),
  mobilePicker: $("#mobileAlgorithmSelect"), category: $("#toolCategory"), title: $("#toolTitle"),
  description: $("#toolDescription"), badges: $("#toolBadges"), actions: $("#actionSwitcher"), config: $("#configForm"),
  source: $("#sourceText"), inputCount: $("#inputCount"), resultText: $("#resultText"), run: $("#runButton"),
  sample: $("#sampleButton"), clear: $("#clearButton"), swap: $("#swapButton"), copy: $("#copyButton"),
  download: $("#downloadButton"), copyError: $("#copyErrorButton"), toast: $("#toast"),
  error: {
    panel: $("#errorPanel"), title: $("#errorTitle"), message: $("#errorMessage"), details: $("#errorDetails"),
    result: { indicator: $("#resultIndicator"), status: $("#resultStatus"), time: $("#resultTime") }
  }
};

const initialId = algorithms.some((item) => item.id === loadSetting("algorithm", "unicode")) ? loadSetting("algorithm", "unicode") : "unicode";
const state = {
  selectedId: initialId,
  configs: new Map(),
  actions: new Map(),
  fieldErrors: {},
  running: false,
  toastTimer: 0
};

setupTheme(elements.theme);
installGlobalErrorLogging();
renderMobilePicker(elements.mobilePicker, algorithms, state.selectedId);
bindEvents();
selectAlgorithm(state.selectedId, false);
logAppReady({ algorithmCount: algorithms.length, selectedAlgorithm: state.selectedId });
elements.source.focus({ preventScroll: true });

function currentAlgorithm() { return getAlgorithm(state.selectedId); }
function currentConfig() {
  if (!state.configs.has(state.selectedId)) state.configs.set(state.selectedId, defaultConfig(currentAlgorithm()));
  return state.configs.get(state.selectedId);
}
function currentAction() {
  if (!state.actions.has(state.selectedId)) {
    const algorithm = currentAlgorithm();
    state.actions.set(state.selectedId, algorithm.defaultAction || algorithm.actions[0].id);
  }
  return state.actions.get(state.selectedId);
}

function bindEvents() {
  elements.search.addEventListener("input", renderNav);
  elements.mobilePicker.addEventListener("change", () => selectAlgorithm(elements.mobilePicker.value));
  elements.source.addEventListener("input", updateInputCount);
  elements.source.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); execute(); }
  });
  elements.run.addEventListener("click", execute);
  elements.sample.addEventListener("click", () => { elements.source.value = currentAlgorithm().sample || ""; updateInputCount(); elements.source.focus(); });
  elements.clear.addEventListener("click", clearCurrent);
  elements.swap.addEventListener("click", swapInputOutput);
  elements.copy.addEventListener("click", () => copyText(elements.resultText.value, "结果已复制"));
  elements.copyError.addEventListener("click", () => copyText(elements.error.details.textContent, "错误详情已复制"));
  elements.download.addEventListener("click", downloadResult);
}

function selectAlgorithm(id, clear = true) {
  const previousId = state.selectedId;
  if (clear && id !== state.selectedId) clearSensitiveValues(currentAlgorithm());
  state.selectedId = id;
  saveSetting("algorithm", id);
  state.fieldErrors = {};
  elements.mobilePicker.value = id;
  renderNav();
  renderTool();
  if (clear) clearResult();
  if (clear && previousId !== id) logAlgorithmSelection({ from: previousId, to: id, category: currentAlgorithm().category });
}

function renderNav() {
  const count = renderAlgorithmNav(elements.nav, algorithms, state.selectedId, elements.search.value, (id) => selectAlgorithm(id));
  elements.navEmpty.hidden = count > 0;
}

function renderTool() {
  const algorithm = currentAlgorithm();
  elements.category.textContent = algorithm.category;
  elements.title.textContent = algorithm.title;
  elements.description.textContent = algorithm.description;
  elements.badges.replaceChildren(...(algorithm.badges || []).map((text) => {
    const badge = document.createElement("span"); badge.className = "badge"; badge.textContent = text; return badge;
  }));
  renderSettings();
  updateInputCount();
}

function renderSettings() {
  const algorithm = currentAlgorithm();
  const action = currentAction();
  const config = currentConfig();
  renderActions(elements.actions, algorithm, action, (nextAction) => {
    const previousAction = currentAction();
    state.actions.set(state.selectedId, nextAction);
    state.fieldErrors = {};
    renderSettings();
    clearResult();
    if (previousAction !== nextAction) logActionSelection({ algorithm: algorithm.id, from: previousAction, to: nextAction });
  });
  renderConfigForm(elements.config, algorithm, action, config, state.fieldErrors, (field) => {
    delete state.fieldErrors[field.id];
    if (field.type === "select" || field.type === "checkbox") renderSettings();
  });
}

async function execute() {
  if (state.running) return;
  const algorithm = currentAlgorithm();
  const action = currentAction();
  const config = currentConfig();
  state.fieldErrors = validateConfig(algorithm, action, config);
  if (Object.keys(state.fieldErrors).length) {
    renderSettings();
    const normalized = normalizeError(new AppError("CONFIG_INVALID", "部分配置缺失或格式不正确，请修正标出的字段。"), {
      algorithm: algorithm.id, action, stage: "validate", inputLength: elements.source.value.length
    });
    logValidationFailure({ algorithm: algorithm.id, action, fields: Object.keys(state.fieldErrors) });
    showError(elements.error, normalized);
    return;
  }

  hideError(elements.error);
  setRunning(true);
  setResultState(elements.error.result, "running", "正在转换");
  try {
    const result = await runAlgorithm(algorithm, action, elements.source.value, { ...config });
    elements.resultText.value = result.output;
    elements.copy.disabled = false;
    elements.download.disabled = false;
    elements.swap.hidden = !isReversible(algorithm) || !result.output;
    elements.error.result.indicator.dataset.executor = result.executionTarget;
    setResultState(elements.error.result, "success", result.output ? "转换完成" : "转换完成（空结果）", result.duration);
  } catch (normalized) {
    elements.resultText.value = "";
    elements.copy.disabled = true;
    elements.download.disabled = true;
    elements.swap.hidden = true;
    delete elements.error.result.indicator.dataset.executor;
    showError(elements.error, normalized.error && normalized.diagnostic ? normalized : normalizeError(normalized));
  } finally {
    setRunning(false);
  }
}

function setRunning(running) {
  state.running = running;
  elements.run.disabled = running;
  elements.run.firstElementChild.textContent = running ? "正在处理…" : "开始转换";
}

function clearCurrent() {
  state.configs.set(state.selectedId, defaultConfig(currentAlgorithm()));
  state.fieldErrors = {};
  elements.source.value = "";
  renderSettings();
  updateInputCount();
  clearResult();
  elements.source.focus();
}

function clearResult() {
  hideError(elements.error);
  elements.resultText.value = "";
  elements.copy.disabled = true;
  elements.download.disabled = true;
  elements.swap.hidden = true;
  delete elements.error.result.indicator.dataset.executor;
  setResultState(elements.error.result, "idle", "等待转换");
}

function clearSensitiveValues(algorithm) {
  const config = state.configs.get(algorithm.id);
  if (!config) return;
  for (const field of algorithm.fields || []) if (field.secret) config[field.id] = field.defaultValue || "";
}

function swapInputOutput() {
  if (!elements.resultText.value) return;
  elements.source.value = elements.resultText.value;
  const action = currentAction();
  const reverse = { encode: "decode", decode: "encode", encrypt: "decrypt", decrypt: "encrypt" }[action];
  if (reverse) state.actions.set(state.selectedId, reverse);
  renderSettings();
  updateInputCount();
  clearResult();
  elements.source.focus();
}

function isReversible(algorithm) {
  const ids = algorithm.actions.map((item) => item.id);
  return (ids.includes("encode") && ids.includes("decode")) || (ids.includes("encrypt") && ids.includes("decrypt"));
}

function updateInputCount() {
  const value = elements.source.value;
  const points = [...value].length;
  const bytes = new TextEncoder().encode(value).length;
  elements.inputCount.textContent = `${points.toLocaleString()} 字符 · ${bytes.toLocaleString()} 字节`;
}

async function copyText(text, successMessage) {
  if (!text) return;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      elements.resultText.focus(); elements.resultText.select();
      if (!document.execCommand("copy")) throw new Error("copy command returned false");
    }
    showToast(successMessage);
  } catch (error) {
    console.error("[Encode/Decode] 复制失败", error);
    showToast("复制失败，请手动选择内容");
  }
}

function downloadResult() {
  if (!elements.resultText.value) return;
  const blob = new Blob([elements.resultText.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.selectedId}-${currentAction()}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2200);
}

window.EncodeDecodeApp = { algorithms, run: execute, diagnostic: formatDiagnostic };
