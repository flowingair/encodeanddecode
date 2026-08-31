const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(check, message, timeout = 6000) {
  const start = performance.now();
  while (performance.now() - start < timeout) {
    if (check()) return;
    await delay(25);
  }
  throw new Error(message);
}

function selectAlgorithm(id) {
  document.querySelector(`[data-algorithm="${id}"]`).click();
}

function selectAction(label) {
  [...document.querySelectorAll(".action-option")].find((button) => button.textContent === label).click();
}

function setInput(value) {
  const input = document.querySelector("#sourceText");
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function setField(id, value) {
  const input = document.querySelector(`#config-${id}`);
  input.value = value;
  input.dispatchEvent(new Event(input.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
}

async function run() {
  document.querySelector("#runButton").click();
  await waitFor(() => !document.querySelector("#runButton").disabled, "转换没有在预期时间内结束");
}

export async function runUiTests() {
  const results = [];
  const test = async (name, check) => {
    try { await check(); results.push({ name, ok: true }); }
    catch (error) { results.push({ name, ok: false, error: error.message }); }
  };

  await test("第三方依赖未在首页预加载", async () => {
    const resources = performance.getEntriesByType("resource").map((entry) => entry.name);
    if (resources.some((url) => url.includes("crypto-js.js") || url.includes("morse.js"))) throw new Error("首页已经加载第三方算法库");
  });

  await test("Base64 页面转换", async () => {
    selectAlgorithm("base64"); setInput("你好"); await run();
    if (document.querySelector("#resultText").value !== "5L2g5aW9") throw new Error("Base64 输出不匹配");
  });

  await test("URL 错误展示", async () => {
    selectAlgorithm("url"); selectAction("解码"); setInput("%ZZ"); await run();
    if (document.querySelector("#errorPanel").hidden) throw new Error("无效 URL 未显示错误面板");
    if (!document.querySelector("#errorDetails").textContent.includes("URIError")) throw new Error("错误详情缺少原始异常类型");
  });

  await test("SHA-256 页面转换", async () => {
    selectAlgorithm("hash"); setInput("abc"); await run();
    if (document.querySelector("#resultText").value !== "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad") throw new Error("SHA-256 输出不匹配");
    if (!performance.getEntriesByType("resource").some((entry) => entry.name.includes("crypto-js.js"))) throw new Error("CryptoJS 未按需加载");
  });

  await test("AES 口令往返", async () => {
    selectAlgorithm("aes"); setField("key", "test-passphrase"); setInput("AES 页面往返"); await run();
    const encrypted = document.querySelector("#resultText").value;
    if (!encrypted) throw new Error("AES 加密没有输出");
    selectAction("解密"); setInput(encrypted); await run();
    if (document.querySelector("#resultText").value !== "AES 页面往返") throw new Error("AES 解密输出不匹配");
  });

  await test("AES-GCM 口令往返", async () => {
    selectAlgorithm("aes"); selectAction("加密"); setField("mode", "GCM"); setField("key", "gcm-passphrase"); setField("gcmIterations", "2"); setInput("AES-GCM 页面往返"); await run();
    const encrypted = document.querySelector("#resultText").value;
    if (!encrypted) throw new Error("AES-GCM 加密没有输出");
    selectAction("解密"); setInput(encrypted); await run();
    if (document.querySelector("#resultText").value !== "AES-GCM 页面往返") throw new Error("AES-GCM 解密输出不匹配");
  });

  await test("大输入自动使用 Worker", async () => {
    selectAlgorithm("base64"); setInput("a".repeat(140000)); await run();
    if (document.querySelector("#resultText").value.length !== 186668) throw new Error("大输入 Base64 输出长度不正确");
    if (document.querySelector("#resultIndicator").dataset.executor !== "worker") throw new Error("大输入没有启动 Worker");
  });

  await test("Worker 算法", async () => {
    selectAlgorithm("jsfuck"); setInput("1"); await run();
    if (!document.querySelector("#resultText").value) throw new Error("JSFuck Worker 没有输出");
  });

  await test("颜文字 Worker", async () => {
    selectAlgorithm("kimoji"); setInput("A"); await run();
    if (!document.querySelector("#resultText").value.includes("ﾟ")) throw new Error("颜文字编码没有有效输出");
  });

  await test("Brainfuck Worker 往返", async () => {
    selectAlgorithm("brainfuck"); setInput("A"); await run();
    const encoded = document.querySelector("#resultText").value;
    if (!encoded) throw new Error("Brainfuck 编码没有输出");
    selectAction("解码"); setInput(encoded); await run();
    if (document.querySelector("#resultText").value !== "A") throw new Error("Brainfuck 解码结果不匹配");
  });

  await test("摩尔斯电码往返", async () => {
    selectAlgorithm("morse"); setInput("SOS"); await run();
    const encoded = document.querySelector("#resultText").value;
    selectAction("解码"); setInput(encoded); await run();
    if (document.querySelector("#resultText").value.trim() !== "SOS") throw new Error("摩尔斯电码解码结果不匹配");
    if (!performance.getEntriesByType("resource").some((entry) => entry.name.includes("morse.js"))) throw new Error("Morse 库未按需加载");
  });

  await test("PBKDF2 Worker", async () => {
    selectAlgorithm("pbkdf2"); setField("iterations", "2"); setInput("password"); await run();
    if (document.querySelector("#resultText").value.length !== 64) throw new Error("PBKDF2 输出长度不正确");
  });

  await test("VBScript 不支持提示", async () => {
    selectAlgorithm("vbs"); selectAction("编码"); setInput("test"); await run();
    if (document.querySelector("#errorPanel").hidden) throw new Error("VBScript 编码未显示错误");
    if (!document.querySelector("#errorMessage").textContent.includes("ActiveX")) throw new Error("VBScript 错误提示不明确");
  });

  await test("手动主题", async () => {
    const select = document.querySelector("#themeSelect");
    select.value = "dark"; select.dispatchEvent(new Event("change", { bubbles: true }));
    if (document.documentElement.dataset.theme !== "dark") throw new Error("深色主题未应用");
    select.value = "system"; select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  return { passed: results.filter((item) => item.ok).length, total: results.length, results };
}
