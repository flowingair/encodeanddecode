import { AppError } from "../core/errors.js";

const MAGIC = new Uint8Array([0x45, 0x44, 0x47, 0x31]); // EDG1
const HEADER_LENGTH = 11;
const IV_LENGTH = 12;
const DEFAULT_SALT_LENGTH = 16;

export async function aesGcmTransform(action, input, config) {
  if (!globalThis.crypto?.subtle) throw new AppError("WEB_CRYPTO_UNAVAILABLE", "当前浏览器不支持 Web Crypto AES-GCM。");
  try {
    return action === "encrypt" ? await encrypt(input, config) : await decrypt(input, config);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = action === "decrypt"
      ? "AES-GCM 解密或完整性校验失败，请检查密钥、口令和密文。"
      : "AES-GCM 加密失败，请检查密钥和配置。";
    throw new AppError("AES_GCM_FAILED", message, { cause: error });
  }
}

async function encrypt(input, config) {
  const passphrase = config.keyMode === "passphrase";
  const salt = passphrase ? createSalt(config.gcmSalt) : new Uint8Array();
  const iterations = passphrase ? Number(config.gcmIterations) : 0;
  if (passphrase && (!Number.isInteger(iterations) || iterations < 1 || iterations > 1000000)) {
    throw new AppError("INVALID_ITERATIONS", "口令迭代次数必须是 1 至 1,000,000 之间的整数。", { field: "gcmIterations" });
  }
  const iv = config.gcmIv ? parseHex(config.gcmIv, "GCM IV") : crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  if (iv.length !== IV_LENGTH) throw new AppError("INVALID_IV_LENGTH", "AES-GCM IV 必须是 12 字节（24 个 Hex 字符）。", { field: "gcmIv" });
  const key = await createKey(config, salt, iterations);
  const plaintext = new TextEncoder().encode(input);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, plaintext));
  return encodeEnvelope({ passphrase, salt, iterations, iv, encrypted }, config.outputFormat);
}

async function decrypt(input, config) {
  const envelope = decodeEnvelope(input, config.inputFormat);
  const expectedPassphrase = config.keyMode === "passphrase";
  if (envelope.passphrase !== expectedPassphrase) {
    throw new AppError("KEY_MODE_MISMATCH", `该密文使用${envelope.passphrase ? "口令" : "原始 Hex 密钥"}，请切换密钥类型。`, { field: "keyMode" });
  }
  const key = await createKey(config, envelope.salt, envelope.iterations);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: envelope.iv, tagLength: 128 }, key, envelope.encrypted);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(decrypted);
  } catch (error) {
    throw new AppError("INVALID_UTF8", "AES-GCM 解密结果不是有效的 UTF-8 文本。", { cause: error });
  }
}

async function createKey(config, salt, iterations) {
  if (config.keyMode === "raw") {
    const keyBytes = parseHex(config.key, "原始密钥");
    if (![16, 24, 32].includes(keyBytes.length)) {
      throw new AppError("INVALID_KEY_LENGTH", `AES-GCM 密钥长度应为 16、24 或 32 字节，当前为 ${keyBytes.length} 字节。`, { field: "key" });
    }
    return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
  }

  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(config.key), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function createSalt(value) {
  const salt = value ? new TextEncoder().encode(value) : crypto.getRandomValues(new Uint8Array(DEFAULT_SALT_LENGTH));
  if (salt.length > 255) throw new AppError("SALT_TOO_LONG", "GCM 盐不能超过 255 个 UTF-8 字节。", { field: "gcmSalt" });
  return salt;
}

function encodeEnvelope({ passphrase, salt, iterations, iv, encrypted }, format) {
  const result = new Uint8Array(HEADER_LENGTH + salt.length + iv.length + encrypted.length);
  result.set(MAGIC, 0);
  result[4] = passphrase ? 1 : 0;
  result[5] = salt.length;
  new DataView(result.buffer).setUint32(6, iterations, false);
  result[10] = iv.length;
  result.set(salt, HEADER_LENGTH);
  result.set(iv, HEADER_LENGTH + salt.length);
  result.set(encrypted, HEADER_LENGTH + salt.length + iv.length);
  return encodeBytes(result, format);
}

function decodeEnvelope(input, format) {
  const bytes = decodeBytes(input, format);
  if (bytes.length < HEADER_LENGTH + IV_LENGTH + 16 || !MAGIC.every((value, index) => bytes[index] === value)) {
    throw new AppError("INVALID_GCM_ENVELOPE", "密文不是本工具生成的有效 AES-GCM 内容。");
  }
  const saltLength = bytes[5];
  const iterations = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(6, false);
  const ivLength = bytes[10];
  const payloadStart = HEADER_LENGTH + saltLength + ivLength;
  if (ivLength !== IV_LENGTH || payloadStart + 16 > bytes.length) throw new AppError("INVALID_GCM_ENVELOPE", "AES-GCM 密文头部或认证标签不完整。");
  return {
    passphrase: bytes[4] === 1,
    iterations,
    salt: bytes.slice(HEADER_LENGTH, HEADER_LENGTH + saltLength),
    iv: bytes.slice(HEADER_LENGTH + saltLength, payloadStart),
    encrypted: bytes.slice(payloadStart)
  };
}

function parseHex(value, label) {
  const compact = String(value || "").trim();
  if (!/^(?:[0-9a-fA-F]{2})+$/.test(compact)) throw new AppError("INVALID_HEX", `${label}必须是偶数长度的 Hex 字符串。`);
  return Uint8Array.from(compact.match(/.{2}/g), (pair) => parseInt(pair, 16));
}

function encodeBytes(bytes, format) {
  if (format === "hex") return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return btoa(binary);
}

function decodeBytes(input, format) {
  const compact = String(input || "").replace(/\s+/g, "");
  try {
    if (format === "hex") {
      if (!/^(?:[0-9a-fA-F]{2})+$/.test(compact)) throw new Error("Invalid Hex");
      return Uint8Array.from(compact.match(/.{2}/g), (pair) => parseInt(pair, 16));
    }
    const binary = atob(compact);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch (error) {
    throw new AppError("INVALID_CIPHERTEXT_FORMAT", `密文不是有效的 ${format === "hex" ? "Hex" : "Base64"}。`, { cause: error });
  }
}
