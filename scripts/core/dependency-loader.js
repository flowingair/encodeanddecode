import { AppError } from "./errors.js";

const pending = new Map();
const CRYPTO_ALGORITHMS = new Set(["hash", "hmac", "pbkdf2", "aes", "des", "tripledes", "rc4", "rabbit"]);

export async function loadAlgorithmDependencies(algorithmId, config = {}) {
  if (algorithmId === "morse") {
    await loadScript("morjs", "libs/morse/1.1.0/morse.js", () => Boolean(globalThis.morjs));
  }
  if (CRYPTO_ALGORITHMS.has(algorithmId) && !(algorithmId === "aes" && config.mode === "GCM")) {
    await loadScript("crypto-js", "libs/crypto-js/3.1.9/crypto-js.js", () => Boolean(globalThis.CryptoJS));
  }
}

function loadScript(id, source, isReady) {
  if (isReady()) return Promise.resolve();
  if (pending.has(id)) return pending.get(id);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.dataset.dependency = id;
    script.addEventListener("load", () => {
      if (!isReady()) {
        reject(new AppError("LIBRARY_MISSING", `${id} 已下载但没有正确初始化。`));
        return;
      }
      console.info("[Encode/Decode] 依赖已按需加载", { dependency: id, source });
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new AppError("LIBRARY_LOAD_FAILED", `无法加载依赖 ${id}。`, { details: source })), { once: true });
    document.head.append(script);
  });
  pending.set(id, promise);
  promise.catch(() => pending.delete(id));
  return promise;
}
