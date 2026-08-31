import { AppError } from "../core/errors.js";

export function unicodeTransform(action, input, config) {
  if (action === "decode") {
    try {
      return input.replace(/\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|\\([0-7]{1,3})/g, (_, braced, unicode, hex, octal) => {
        const value = parseInt(braced || unicode || hex || octal, octal ? 8 : 16);
        if (value > 0x10ffff) throw new AppError("INVALID_UNICODE", "Unicode 码点超出有效范围。", { details: `codePoint=${value}` });
        return braced ? String.fromCodePoint(value) : String.fromCharCode(value);
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("INVALID_UNICODE", "Unicode 转义序列无效。", { cause: error });
    }
  }

  const upper = config.hexCase !== "lower";
  let output = "";
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    if (!config.escapeAll && code <= 0x7f) {
      output += input[index];
      continue;
    }
    let hex = code.toString(16).padStart(4, "0");
    if (upper) hex = hex.toUpperCase();
    output += `\\u${hex}`;
  }
  return output;
}

export function urlTransform(action, input, config) {
  if (action === "encode") return config.scope === "uri" ? encodeURI(input) : encodeURIComponent(input);
  return config.scope === "uri" ? decodeURI(input) : decodeURIComponent(input);
}

export function base64Transform(action, input, config) {
  if (action === "encode") {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    let output = btoa(binary);
    if (config.variant === "url") output = output.replace(/\+/g, "-").replace(/\//g, "_");
    if (!config.padding) output = output.replace(/=+$/, "");
    return output;
  }

  let encoded = input.trim().replace(/\s+/g, "");
  if (config.variant === "url") encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) throw new AppError("INVALID_BASE64", "输入不是有效的 Base64 内容。");
  encoded += "=".repeat((4 - encoded.length % 4) % 4);
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new AppError("INVALID_BASE64", "Base64 内容无效，或解码结果不是 UTF-8 文本。", { cause: error });
  }
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Transform(action, input, config) {
  if (action === "encode") {
    const bytes = new TextEncoder().encode(input);
    let bits = "";
    for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
    let output = "";
    for (let index = 0; index < bits.length; index += 5) {
      output += BASE32_ALPHABET[parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)];
    }
    if (config.padding) output += "=".repeat((8 - output.length % 8) % 8);
    return output;
  }

  const encoded = input.toUpperCase().replace(/\s+/g, "").replace(/=+$/, "");
  if (!/^[A-Z2-7]*$/.test(encoded)) throw new AppError("INVALID_BASE32", "输入包含 Base32 字母表之外的字符。");
  let bits = "";
  for (const char of encoded) bits += BASE32_ALPHABET.indexOf(char).toString(2).padStart(5, "0");
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(parseInt(bits.slice(index, index + 8), 2));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch (error) {
    throw new AppError("INVALID_BASE32", "Base32 解码结果不是有效的 UTF-8 文本。", { cause: error });
  }
}

export function decimalTransform(action, input, config) {
  const separator = config.separator;
  if (!separator) throw new AppError("INVALID_SEPARATOR", "分隔符不能为空。", { field: "separator" });
  if (action === "encode") return Array.from(input, (char) => char.codePointAt(0)).join(separator);
  if (!input.trim()) return "";
  return input.split(separator).map((part, index) => {
    const value = Number(part.trim());
    if (!Number.isInteger(value) || value < 0 || value > 0x10ffff) {
      throw new AppError("INVALID_CODE_POINT", `第 ${index + 1} 项不是有效的 Unicode 码点。`, { details: `value=${part}` });
    }
    return String.fromCodePoint(value);
  }).join("");
}

export function statsTransform(input, config) {
  const counts = new Map();
  for (const char of input) counts.set(char, (counts.get(char) || 0) + 1);
  let entries = [...counts.entries()];
  if (config.sort === "codepoint") entries.sort((a, b) => a[0].codePointAt(0) - b[0].codePointAt(0));
  else entries.sort((a, b) => b[1] - a[1] || a[0].codePointAt(0) - b[0].codePointAt(0));

  const byteLength = new TextEncoder().encode(input).length;
  const lines = input === "" ? 0 : input.split(/\r\n|\r|\n/).length;
  const printable = (char) => ({ " ": "␠ 空格", "\n": "↵ 换行", "\r": "␍ 回车", "\t": "⇥ 制表符" }[char] || char);
  const details = entries.map(([char, count]) => `${printable(char)}\t${count}\tU+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
  return [
    `UTF-16 长度：${input.length}`,
    `Unicode 码点：${[...input].length}`,
    `UTF-8 字节数：${byteLength}`,
    `行数：${lines}`,
    `不同字符：${counts.size}`,
    "",
    "字符\t次数\t码点",
    ...details
  ].join("\n");
}
