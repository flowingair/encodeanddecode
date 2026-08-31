import { AppError } from "../core/errors.js";

function crypto() {
  if (!globalThis.CryptoJS) throw new AppError("LIBRARY_MISSING", "CryptoJS 未能加载，请刷新页面后重试。");
  return globalThis.CryptoJS;
}

function encoder(format) {
  const C = crypto();
  return format === "base64" ? C.enc.Base64 : C.enc.Hex;
}

function formatWordArray(wordArray, format, uppercase = false) {
  let output = wordArray.toString(encoder(format));
  if (format === "hex" && uppercase) output = output.toUpperCase();
  return output;
}

export function hashTransform(input, config) {
  const C = crypto();
  const hash = C[config.digest];
  if (typeof hash !== "function") throw new AppError("UNSUPPORTED_DIGEST", `不支持摘要算法 ${config.digest}。`);
  return formatWordArray(hash(input), config.outputFormat, config.uppercase);
}

export function hmacTransform(input, config) {
  const C = crypto();
  const hmac = C[`Hmac${config.digest}`];
  if (typeof hmac !== "function") throw new AppError("UNSUPPORTED_DIGEST", `不支持 HMAC-${config.digest}。`);
  return formatWordArray(hmac(input, config.key), config.outputFormat, config.uppercase);
}

export function pbkdf2Transform(password, config) {
  const C = crypto();
  const hasher = C.algo[config.digest];
  if (!hasher) throw new AppError("UNSUPPORTED_DIGEST", `PBKDF2 不支持 ${config.digest}。`);
  const derived = C.PBKDF2(password, config.salt, {
    keySize: Number(config.keyBytes) / 4,
    iterations: Number(config.iterations),
    hasher
  });
  return formatWordArray(derived, config.outputFormat);
}

const cipherNames = { aes: "AES", des: "DES", tripledes: "TripleDES", rc4: "RC4", rabbit: "Rabbit" };
const rawKeyLengths = { aes: [16, 24, 32], des: [8], tripledes: [16, 24], rabbit: [16] };
const ivLengths = { aes: 16, des: 8, tripledes: 8, rabbit: 8 };

function parseHex(value, label, required = true) {
  const compact = String(value || "").trim();
  if (!compact && !required) return null;
  if (!compact) throw new AppError("REQUIRED_CRYPTO_VALUE", `请填写${label}。`);
  if (!/^(?:[0-9a-fA-F]{2})+$/.test(compact)) throw new AppError("INVALID_HEX", `${label}必须是偶数长度的 Hex 字符串。`);
  return crypto().enc.Hex.parse(compact);
}

function validateRawKey(id, value) {
  const key = parseHex(value, "原始密钥");
  const allowed = rawKeyLengths[id];
  if (allowed && !allowed.includes(key.sigBytes)) {
    throw new AppError("INVALID_KEY_LENGTH", `${cipherNames[id]} 密钥长度应为 ${allowed.join("、")} 字节，当前为 ${key.sigBytes} 字节。`, { field: "key" });
  }
  return key;
}

function cipherConfig(id, config) {
  const C = crypto();
  const result = {};
  if (["aes", "des", "tripledes"].includes(id)) {
    if (!C.mode[config.mode]) throw new AppError("INVALID_MODE", `不支持工作模式 ${config.mode}。`);
    if (!C.pad[config.padding]) throw new AppError("INVALID_PADDING", `不支持填充方式 ${config.padding}。`);
    result.mode = C.mode[config.mode];
    result.padding = C.pad[config.padding];
  }
  if (config.keyMode === "raw" && config.mode !== "ECB" && id !== "rc4") {
    const iv = parseHex(config.iv, "IV", id !== "rabbit");
    if (iv) {
      const expected = ivLengths[id];
      if (expected && iv.sigBytes !== expected) throw new AppError("INVALID_IV_LENGTH", `${cipherNames[id]} 的 IV 必须是 ${expected} 字节，当前为 ${iv.sigBytes} 字节。`, { field: "iv" });
      result.iv = iv;
    }
  }
  return result;
}

export function cipherTransform(id, action, input, config) {
  const C = crypto();
  const name = cipherNames[id];
  const cipher = C[name];
  if (!cipher) throw new AppError("UNSUPPORTED_CIPHER", `当前 CryptoJS 包不支持 ${name}。`);
  const options = cipherConfig(id, config);
  const raw = config.keyMode === "raw";
  const key = raw ? validateRawKey(id, config.key) : config.key;

  try {
    if (action === "encrypt") {
      const encrypted = cipher.encrypt(input, key, options);
      return raw ? encrypted.ciphertext.toString(encoder(config.outputFormat)) : encrypted.toString();
    }

    const payload = raw
      ? C.lib.CipherParams.create({ ciphertext: encoder(config.inputFormat).parse(input.replace(/\s+/g, "")) })
      : input.trim();
    const decrypted = cipher.decrypt(payload, key, options);
    const output = decrypted.toString(C.enc.Utf8);
    if (!output && input) throw new AppError("DECRYPTION_EMPTY", "解密结果为空，请检查密钥、IV、模式、填充和密文格式。", { details: "CryptoJS returned an empty UTF-8 result." });
    return output;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("CRYPTO_FAILED", action === "encrypt" ? "加密失败，请检查密钥和配置。" : "解密失败，请检查密钥、IV 和密文格式。", { cause: error });
  }
}
