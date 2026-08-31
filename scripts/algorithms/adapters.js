import { AppError } from "../core/errors.js";
import { unicodeTransform, urlTransform, base64Transform, base32Transform, decimalTransform, statsTransform } from "./native-codecs.js";
import { hashTransform, hmacTransform, pbkdf2Transform, cipherTransform } from "./crypto-adapters.js";
import { aesGcmTransform } from "./aes-gcm.js";

export async function executeAdapter(algorithmId, action, input, config) {
  switch (algorithmId) {
    case "unicode": return unicodeTransform(action, input, config);
    case "url": return urlTransform(action, input, config);
    case "base64": return base64Transform(action, input, config);
    case "base32": return base32Transform(action, input, config);
    case "decimal": return decimalTransform(action, input, config);
    case "morse": return morseTransform(action, input, config);
    case "jsfuck": return jsfuckTransform(input, config);
    case "kimoji": return kimojiTransform(input);
    case "brainfuck": return brainfuckTransform(action, input);
    case "vbs": return vbsTransform(action, input);
    case "hash": return hashTransform(input, config);
    case "hmac": return hmacTransform(input, config);
    case "stats": return statsTransform(input, config);
    case "pbkdf2": return pbkdf2Transform(input, config);
    case "aes":
      if (config.mode === "GCM") return aesGcmTransform(action, input, config);
      return cipherTransform(algorithmId, action, input, config);
    case "des": case "tripledes": case "rc4": case "rabbit":
      return cipherTransform(algorithmId, action, input, config);
    default: throw new AppError("ALGORITHM_NOT_FOUND", `没有找到算法 ${algorithmId}。`);
  }
}

function jsfuckTransform(input, config) {
  if (!globalThis.JSFuck) throw new AppError("LIBRARY_MISSING", "JSFuck 库未能加载。");
  return globalThis.JSFuck.encode(input, Boolean(config.executable));
}

function kimojiTransform(input) {
  if (typeof globalThis.kimojiEncode !== "function") throw new AppError("LIBRARY_MISSING", "颜文字编码器未能加载。");
  return globalThis.kimojiEncode(input);
}

function brainfuckTransform(action, input) {
  const handler = action === "encode" ? globalThis.brainfuckEncode : globalThis.brainfuckDecode;
  if (typeof handler !== "function") throw new AppError("LIBRARY_MISSING", "Brainfuck 编码器未能加载。");
  const output = handler(input);
  if (/^(?:error|too long)/i.test(String(output))) throw new AppError("BRAINFUCK_FAILED", `Brainfuck 执行失败：${output}`);
  return output;
}

function morseTransform(action, input, config) {
  if (!globalThis.morjs) throw new AppError("LIBRARY_MISSING", "摩尔斯电码库未能加载。");
  try {
    return action === "encode" ? globalThis.morjs.encode(input, { mode: config.mode }) : globalThis.morjs.decode(input, { mode: config.mode });
  } catch (error) {
    throw new AppError("MORSE_FAILED", "摩尔斯电码内容或模式无效。", { cause: error });
  }
}

function vbsTransform(action, input) {
  if (action === "encode") {
    throw new AppError("BROWSER_UNSUPPORTED", "现代浏览器不支持 ActiveX，无法执行 VBScript 编码；解码功能仍然可用。");
  }
  if (typeof globalThis.vbsDecode !== "function") throw new AppError("LIBRARY_MISSING", "VBScript 解码器未能加载。");
  try { return globalThis.vbsDecode(input); }
  catch (error) { throw new AppError("VBS_DECODE_FAILED", "VBScript 编码内容无效或不完整。", { cause: error }); }
}
