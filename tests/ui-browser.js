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

  await test("Base64 宽松解码和 xxd 展示", async () => {
    selectAction("解码"); setField("decodeMode", "ignoreInvalid"); setField("outputMode", "xxd"); setInput("/!w@B#B"); await run();
    const result = document.querySelector("#resultText").value;
    if (!result.includes("文本（UTF-8）") || !result.includes("00000000: ff00 41") || !result.includes("..A")) throw new Error("Base64 xxd 输出不匹配");
  });

  await test("Hex 页面解码", async () => {
    selectAlgorithm("hex"); setField("outputMode", "xxd"); setInput("48 69 21"); await run();
    const result = document.querySelector("#resultText").value;
    if (!result.includes("文本（UTF-8）\nHi!") || !result.includes("00000000: 4869 21")) throw new Error("Hex xxd 输出不匹配");
  });

  await test("全局自动转换", async () => {
    const toggle = document.querySelector("#autoConvert");
    toggle.checked = true; toggle.dispatchEvent(new Event("change", { bubbles: true }));
    if (localStorage.getItem("encode-decode.autoConvert") !== "true") throw new Error("自动转换设置未保存");
    selectAlgorithm("base64"); selectAction("编码"); setInput("auto");
    await waitFor(() => document.querySelector("#resultText").value === "YXV0bw==", "输入变化后没有自动转换");
    setInput("next");
    await waitFor(() => document.querySelector("#resultText").value === "bmV4dA==", "第二次输入没有自动刷新结果");
    const padding = document.querySelector("#config-padding");
    padding.checked = false; padding.dispatchEvent(new Event("change", { bubbles: true }));
    await waitFor(() => document.querySelector("#resultText").value === "bmV4dA", "选项变化后没有自动刷新结果");
    document.querySelector("#config-padding").checked = true;
    document.querySelector("#config-padding").dispatchEvent(new Event("change", { bubbles: true }));
    await waitFor(() => document.querySelector("#resultText").value === "bmV4dA==", "恢复填充后没有自动刷新结果");
    toggle.checked = false; toggle.dispatchEvent(new Event("change", { bubbles: true }));
  });

  await test("URL 非法序列使用应用错误", async () => {
    selectAlgorithm("url"); selectAction("解码"); setInput("%ZZ"); await run();
    if (document.querySelector("#errorPanel").hidden) throw new Error("无效 URL 未显示错误面板");
    const details = document.querySelector("#errorDetails").textContent;
    if (!details.includes("INVALID_URL_ENCODING")) throw new Error("错误详情缺少应用错误码");
    if (details.includes("URIError")) throw new Error("错误详情仍然暴露原生 URIError");
  });

  await test("所有字符百分号编码模式", async () => {
    selectAlgorithm("url"); selectAction("编码"); setField("scope", "percent"); setInput("Az 中"); await run();
    if (document.querySelector("#resultText").value !== "%41%7A%20%E4%B8%AD") throw new Error("百分号编码输出不匹配");
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
