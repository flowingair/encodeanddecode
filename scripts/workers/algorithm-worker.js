self.window = self;

const CRYPTO_ALGORITHMS = new Set(["hash", "hmac", "pbkdf2", "aes", "des", "tripledes", "rc4", "rabbit"]);

self.addEventListener("message", async ({ data }) => {
  try {
    loadDependency(data.algorithmId, data.action, data.config);
    const { executeAdapter } = await import("../algorithms/adapters.js");
    const output = await executeAdapter(data.algorithmId, data.action, data.input, data.config);
    self.postMessage({ ok: true, output: String(output ?? "") });
  } catch (error) {
    self.postMessage({
      ok: false,
      code: error.code || "WORKER_FAILED",
      message: error.message || String(error),
      details: error.stack || error.details || ""
    });
  }
});

function loadDependency(algorithmId, action, config) {
  if (algorithmId === "morse") importScripts("../../libs/morse/1.1.0/morse.js");
  else if (algorithmId === "jsfuck") importScripts("../../libs/jsfuck/0.4.0/jsfuck.js");
  else if (algorithmId === "kimoji") importScripts("../../libs/codecs/kimoji.js");
  else if (algorithmId === "brainfuck") importScripts("../../libs/codecs/brainfuck.js");
  else if (algorithmId === "vbs" && action === "decode") importScripts("../../libs/codecs/vbs.js");
  else if (CRYPTO_ALGORITHMS.has(algorithmId) && !(algorithmId === "aes" && config.mode === "GCM")) {
    importScripts("../../libs/crypto-js/3.1.9/crypto-js.js");
  }
}
