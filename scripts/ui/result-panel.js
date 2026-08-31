import { formatDiagnostic } from "../core/errors.js";

export function setResultState(elements, status, label, duration = null) {
  elements.indicator.dataset.status = status;
  elements.status.textContent = label;
  elements.time.textContent = duration === null ? "" : `· ${duration.toFixed(1)} ms`;
}

export function showError(elements, normalized) {
  elements.panel.hidden = false;
  elements.title.textContent = normalized.error.code === "CONFIG_INVALID" ? "请检查配置" : "转换失败";
  elements.message.textContent = normalized.error.message;
  elements.details.textContent = formatDiagnostic(normalized.diagnostic);
  setResultState(elements.result, "error", "转换失败");
}

export function hideError(elements) {
  elements.panel.hidden = true;
  elements.message.textContent = "";
  elements.details.textContent = "";
}
