import { unicodeTransform, urlTransform, base64Transform, base32Transform, decimalTransform } from "../scripts/algorithms/native-codecs.js";
import { hashTransform, hmacTransform, pbkdf2Transform, cipherTransform } from "../scripts/algorithms/crypto-adapters.js";
import { aesGcmTransform } from "../scripts/algorithms/aes-gcm.js";

const cases = [
  ["Unicode 往返", () => unicodeTransform("decode", unicodeTransform("encode", "你好 👋", { escapeAll: true, hexCase: "upper" }), {}) === "你好 👋"],
  ["URL 组件往返", () => urlTransform("decode", urlTransform("encode", "中文 & space", { scope: "component" }), { scope: "component" }) === "中文 & space"],
  ["Base64 UTF-8 往返", () => base64Transform("decode", base64Transform("encode", "Hello 世界", { variant: "standard", padding: true }), { variant: "standard" }) === "Hello 世界"],
  ["Base64 URL-safe 往返", () => base64Transform("decode", base64Transform("encode", "✓ URL", { variant: "url", padding: false }), { variant: "url" }) === "✓ URL"],
  ["Base32 UTF-8 往返", () => base32Transform("decode", base32Transform("encode", "Base32 中文", { padding: true }), {}) === "Base32 中文"],
  ["码点往返", () => decimalTransform("decode", decimalTransform("encode", "A👋中", { separator: "," }), { separator: "," }) === "A👋中"],
  ["SHA-256 标准值", () => hashTransform("abc", { digest: "SHA256", outputFormat: "hex", uppercase: false }) === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
  ["HMAC-SHA256 标准值", () => hmacTransform("The quick brown fox jumps over the lazy dog", { digest: "SHA256", key: "key", outputFormat: "hex", uppercase: false }) === "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"],
  ["PBKDF2 输出长度", () => pbkdf2Transform("password", { salt: "salt", iterations: 2, keyBytes: 32, digest: "SHA256", outputFormat: "hex" }).length === 64],
  ["AES 原始密钥往返", () => {
    const config = { keyMode: "raw", key: "000102030405060708090a0b0c0d0e0f", iv: "101112131415161718191a1b1c1d1e1f", mode: "CBC", padding: "Pkcs7", inputFormat: "base64", outputFormat: "base64" };
    const encrypted = cipherTransform("aes", "encrypt", "AES 中文往返", config);
    return cipherTransform("aes", "decrypt", encrypted, config) === "AES 中文往返";
  }],
  ["DES 原始密钥往返", () => cipherRoundTrip("des", { key: "0123456789abcdef", iv: "1234567890abcdef", mode: "CBC", padding: "Pkcs7" })],
  ["TripleDES 原始密钥往返", () => cipherRoundTrip("tripledes", { key: "0123456789abcdeffedcba98765432100011223344556677", iv: "1234567890abcdef", mode: "CBC", padding: "Pkcs7" })],
  ["RC4 原始密钥往返", () => cipherRoundTrip("rc4", { key: "0123456789abcdef" })],
  ["Rabbit 原始密钥往返", () => cipherRoundTrip("rabbit", { key: "000102030405060708090a0b0c0d0e0f", iv: "1011121314151617" })],
  ["AES-GCM 原始密钥往返", async () => {
    const config = { keyMode: "raw", key: "000102030405060708090a0b0c0d0e0f", gcmIv: "101112131415161718191a1b", inputFormat: "base64", outputFormat: "base64" };
    const encrypted = await aesGcmTransform("encrypt", "GCM 原始密钥往返", config);
    return await aesGcmTransform("decrypt", encrypted, config) === "GCM 原始密钥往返";
  }],
  ["AES-GCM 口令往返", async () => {
    const config = { keyMode: "passphrase", key: "test-passphrase", gcmIv: "101112131415161718191a1b", gcmSalt: "test-salt", gcmIterations: 2, inputFormat: "hex", outputFormat: "hex" };
    const encrypted = await aesGcmTransform("encrypt", "GCM 口令往返", config);
    return await aesGcmTransform("decrypt", encrypted, config) === "GCM 口令往返";
  }]
];

function cipherRoundTrip(id, values) {
  const config = { keyMode: "raw", inputFormat: "base64", outputFormat: "base64", ...values };
  const encrypted = cipherTransform(id, "encrypt", `${id} 中文往返`, config);
  return cipherTransform(id, "decrypt", encrypted, config) === `${id} 中文往返`;
}

const lines = [];
let failed = 0;
for (const [name, run] of cases) {
  try {
    const passed = await run();
    lines.push(`${passed ? "✓" : "✗"} ${name}`);
    if (!passed) failed += 1;
  } catch (error) {
    lines.push(`✗ ${name}: ${error.message}`);
    failed += 1;
  }
}
lines.push("", `${cases.length - failed}/${cases.length} 项通过`);
document.querySelector("#output").textContent = lines.join("\n");
document.title = failed ? `失败 ${failed} 项` : "算法测试通过";
if (failed) throw new Error(`${failed} algorithm smoke tests failed`);
