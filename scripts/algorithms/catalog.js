const option = (value, label) => ({ value, label });
const select = (id, label, defaultValue, options, extra = {}) => ({ id, label, type: "select", defaultValue, options, ...extra });
const checkbox = (id, label, defaultValue = false, extra = {}) => ({ id, label, type: "checkbox", defaultValue, ...extra });
const text = (id, label, defaultValue = "", extra = {}) => ({ id, label, type: extra.secret ? "password" : "text", defaultValue, ...extra });
const number = (id, label, defaultValue, extra = {}) => ({ id, label, type: "number", defaultValue, ...extra });
const action = (id, label) => ({ id, label });

const directionActions = [action("encode", "编码"), action("decode", "解码")];
const cipherActions = [action("encrypt", "加密"), action("decrypt", "解密")];
const formatOptions = [option("base64", "Base64"), option("hex", "Hex")];
const byteOutput = select("outputMode", "解码输出", "text", [option("text", "UTF-8 文本"), option("hex", "Hex 字节"), option("xxd", "文本 + xxd 字节视图")], { actions: ["decode"], wide: true });
const keyMode = select("keyMode", "密钥类型", "passphrase", [option("passphrase", "口令"), option("raw", "原始 Hex 密钥")], { wide: true });
const secretKey = text("key", "密钥 / 口令", "", { required: true, secret: true, wide: true, autocomplete: "new-password", help: "敏感值不会保存，也不会写入 Console。" });

function blockCipher(id, title, description, icon, keyHelp) {
  const ivBytes = id === "aes" ? 16 : 8;
  const isAes = id === "aes";
  const modeOptions = isAes ? ["GCM", "CBC", "CFB", "CTR", "OFB", "ECB"] : ["CBC", "CFB", "CTR", "OFB", "ECB"];
  return {
    id, title, description, icon, category: "加密与派生", actions: cipherActions,
    badges: isAes ? ["可逆", "需要密钥"] : ["可逆", "需要密钥", "CryptoJS"], sample: "需要保密的文本",
    fields: [
      keyMode,
      { ...secretKey, help: keyHelp },
      text("iv", "IV（Hex）", "", {
        actions: ["encrypt", "decrypt"],
        when: ({ values }) => values.keyMode === "raw" && values.mode !== "ECB" && values.mode !== "GCM",
        required: true,
        secret: true,
        help: `CBC/CFB/CTR/OFB 模式需要 ${ivBytes} 个字节（${ivBytes * 2} 个 Hex 字符）。`
      }),
      select("mode", "工作模式", "CBC", modeOptions.map((v) => option(v, v))),
      select("padding", "填充", "Pkcs7", ["Pkcs7", "AnsiX923", "Iso10126", "Iso97971", "ZeroPadding", "NoPadding"].map((v) => option(v, v)), { when: ({ values }) => values.mode !== "GCM" }),
      text("gcmIv", "GCM IV（Hex，可选）", "", {
        actions: ["encrypt"], secret: true, wide: true,
        when: ({ values }) => values.mode === "GCM",
        help: "留空将随机生成 12 字节 IV；IV 会自动包含在输出中。"
      }),
      text("gcmSalt", "GCM 盐（UTF-8，可选）", "", {
        actions: ["encrypt"], secret: true,
        when: ({ values }) => values.mode === "GCM" && values.keyMode === "passphrase",
        help: "留空将随机生成；盐会自动包含在输出中。"
      }),
      number("gcmIterations", "口令迭代次数", 100000, {
        actions: ["encrypt"], min: 1, max: 1000000,
        when: ({ values }) => values.mode === "GCM" && values.keyMode === "passphrase"
      }),
      select("inputFormat", "密文输入格式", "base64", formatOptions, { actions: ["decrypt"], when: ({ values }) => values.keyMode === "raw" || values.mode === "GCM" }),
      select("outputFormat", "密文输出格式", "base64", formatOptions, { actions: ["encrypt"], when: ({ values }) => values.keyMode === "raw" || values.mode === "GCM" })
    ]
  };
}

function streamCipher(id, title, description, icon, hasIv = false) {
  const fields = [keyMode, secretKey];
  if (hasIv) fields.push(text("iv", "IV（Hex，可选）", "", { secret: true, when: ({ values }) => values.keyMode === "raw", help: "Rabbit 使用 8 字节 IV。留空表示不使用 IV。" }));
  fields.push(
    select("inputFormat", "密文输入格式", "base64", formatOptions, { actions: ["decrypt"], when: ({ values }) => values.keyMode === "raw" }),
    select("outputFormat", "密文输出格式", "base64", formatOptions, { actions: ["encrypt"], when: ({ values }) => values.keyMode === "raw" })
  );
  return { id, title, description, icon, category: "加密与派生", actions: cipherActions, badges: ["可逆", "需要密钥", "CryptoJS"], sample: "需要保密的文本", fields };
}

export const categoryOrder = ["常用编码", "进阶编码", "代码转换", "摘要与分析", "加密与派生"];

export const algorithms = [
  {
    id: "unicode", title: "Unicode 转义", category: "常用编码", icon: "U+", actions: directionActions,
    description: "在普通文本与 JavaScript 风格的 Unicode 转义序列之间转换。",
    badges: ["可逆", "文本"], sample: "你好, Encode! 👋",
    fields: [
      checkbox("escapeAll", "转义所有字符", false, { actions: ["encode"], help: "关闭时只转义非 ASCII 字符。" }),
      select("hexCase", "Hex 大小写", "upper", [option("upper", "大写"), option("lower", "小写")], { actions: ["encode"] })
    ]
  },
  {
    id: "url", title: "URL 编码", category: "常用编码", icon: "%", actions: directionActions,
    description: "对完整 URI、URL 组件或所有 UTF-8 字节进行百分号编码与解码。",
    badges: ["可逆", "UTF-8"], sample: "https://example.com/搜索?q=编码 测试",
    fields: [select("scope", "处理范围", "component", [option("component", "URL 组件"), option("uri", "完整 URI"), option("percent", "百分号编码（所有字符）")], { wide: true })]
  },
  {
    id: "base64", title: "Base64", category: "常用编码", icon: "64", actions: directionActions,
    description: "转换 UTF-8 文本和 Base64；解码可跳过无效字符并查看原始字节。",
    badges: ["可逆", "UTF-8"], sample: "Encode / Decode 编解码工具",
    fields: [
      select("variant", "变体", "standard", [option("standard", "标准 Base64"), option("url", "URL-safe")]),
      checkbox("padding", "保留末尾填充 =", true, { actions: ["encode"] }),
      select("decodeMode", "解码模式", "strict", [option("strict", "严格"), option("ignoreInvalid", "跳过无效字符")], { actions: ["decode"], help: "宽松模式会跳过字母表之外的字符和填充符。" }),
      byteOutput
    ]
  },
  {
    id: "hex", title: "Hex 字节", category: "常用编码", icon: "16", actions: directionActions,
    description: "将 UTF-8 文本编码为十六进制，或解码十六进制字节并查看文本和 xxd 视图。",
    badges: ["可逆", "字节"], sample: "48656c6c6f20e4b896e7958c", defaultAction: "decode",
    fields: [byteOutput]
  },
  {
    id: "base32", title: "Base32", category: "常用编码", icon: "32", actions: directionActions,
    description: "按照 RFC 4648 字母表转换 UTF-8 文本。",
    badges: ["可逆", "RFC 4648"], sample: "Base32 编码示例",
    fields: [checkbox("padding", "保留末尾填充 =", true, { actions: ["encode"], wide: true })]
  },
  {
    id: "decimal", title: "字符码位", category: "进阶编码", icon: "10", actions: directionActions,
    description: "在文本和十进制 Unicode 码位列表之间转换。",
    badges: ["可逆", "Unicode"], sample: "ABC中文",
    fields: [text("separator", "分隔符", ",", { required: true, help: "解码时也使用这个分隔符。", wide: true })]
  },
  {
    id: "morse", title: "摩尔斯电码", category: "进阶编码", icon: "·−", actions: directionActions,
    description: "使用 mor.js 在文本和摩尔斯电码之间转换。",
    badges: ["可逆", "Latin"], sample: "SOS HELLO 123",
    fields: [select("mode", "表示模式", "simple", [option("simple", "简洁"), option("classic", "经典点划线"), option("compact", "紧凑")], { wide: true })]
  },
  {
    id: "jsfuck", title: "JSFuck", category: "代码转换", icon: "[]", actions: [action("encode", "生成")],
    description: "仅用六种字符生成等价 JavaScript 表达式。不会执行输入或输出。",
    badges: ["单向", "可能很长"], sample: "alert('Hello')",
    fields: [checkbox("executable", "生成可执行包装", false, { help: "输出包含 Function 构造调用；本工具仍不会执行它。", wide: true })], worker: true, timeout: 5000
  },
  {
    id: "kimoji", title: "颜文字编码", category: "代码转换", icon: "顔", actions: [action("encode", "生成")],
    description: "将文本转换成以日文颜文字组成的 JavaScript 表达式。",
    badges: ["单向", "可能很长"], sample: "Hello 世界", fields: [], worker: true, timeout: 5000
  },
  {
    id: "brainfuck", title: "Brainfuck", category: "代码转换", icon: "+>", actions: directionActions,
    description: "生成或解析 Brainfuck 代码；在隔离 Worker 中运行并限制执行时间。",
    badges: ["可逆", "Worker"], sample: "Hello", fields: [number("timeout", "最长执行时间（毫秒）", 1500, { min: 100, max: 5000, wide: true })], worker: true, timeout: 1500
  },
  {
    id: "vbs", title: "VBScript 编码", category: "代码转换", icon: "VB", actions: directionActions,
    defaultAction: "decode",
    description: "解码 Windows Script Encoder 内容。现代浏览器不支持 ActiveX 编码。",
    badges: ["解码可用", "兼容工具", "Worker"], sample: "#@~^...^#~@", fields: [], worker: true, timeout: 3000
  },
  {
    id: "hash", title: "消息摘要", category: "摘要与分析", icon: "#", actions: [action("hash", "计算摘要")],
    description: "计算 MD5、SHA-1 或 SHA-2 摘要。摘要不可逆，不应当用于保存密码。",
    badges: ["单向", "CryptoJS"], sample: "The quick brown fox jumps over the lazy dog",
    fields: [
      select("digest", "摘要算法", "SHA256", ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512"].map((v) => option(v, v))),
      select("outputFormat", "输出格式", "hex", formatOptions),
      checkbox("uppercase", "Hex 使用大写", false, { when: ({ values }) => values.outputFormat === "hex", wide: true })
    ]
  },
  {
    id: "hmac", title: "HMAC", category: "摘要与分析", icon: "HM", actions: [action("hash", "计算 HMAC")],
    description: "使用共享密钥计算消息认证码。",
    badges: ["单向", "需要密钥", "CryptoJS"], sample: "需要验证完整性的消息",
    fields: [
      select("digest", "摘要算法", "SHA256", ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512"].map((v) => option(v, v))),
      secretKey,
      select("outputFormat", "输出格式", "hex", formatOptions),
      checkbox("uppercase", "Hex 使用大写", false, { when: ({ values }) => values.outputFormat === "hex" })
    ]
  },
  {
    id: "stats", title: "字符统计", category: "摘要与分析", icon: "∑", actions: [action("analyze", "分析")],
    description: "统计字符、码位、字节、行数和不同字符的出现次数。",
    badges: ["分析", "Unicode"], sample: "Hello\n你好你好 👋", fields: [select("sort", "字符排序", "frequency", [option("frequency", "按出现次数"), option("codepoint", "按码位")], { wide: true })]
  },
  blockCipher("aes", "AES", "使用 AES 对 UTF-8 文本进行加密或解密。", "AE", "口令模式自动派生密钥；原始模式接受 16、24 或 32 字节 Hex 密钥。"),
  blockCipher("des", "DES", "使用兼容性较弱的 DES 算法进行转换。仅建议处理历史数据。", "DE", "原始 DES 密钥必须是 8 字节 Hex。"),
  blockCipher("tripledes", "TripleDES", "使用 TripleDES 处理历史系统数据。新系统优先选择 AES。", "3D", "原始 TripleDES 密钥应为 16 或 24 字节 Hex。"),
  streamCipher("rc4", "RC4", "兼容旧数据的 RC4 流加密。新系统不应继续使用。", "R4"),
  streamCipher("rabbit", "Rabbit", "使用 Rabbit 流加密算法转换文本。", "RB", true),
  {
    id: "pbkdf2", title: "PBKDF2", category: "加密与派生", icon: "KDF", actions: [action("derive", "派生密钥")],
    description: "通过口令、盐和迭代次数派生固定长度的密钥。",
    badges: ["单向", "口令派生", "CryptoJS"], sample: "correct horse battery staple",
    worker: true, timeout: 20000,
    fields: [
      text("salt", "盐（UTF-8）", "encode-decode", { required: true, secret: true, wide: true }),
      number("iterations", "迭代次数", 10000, { min: 1, max: 1000000 }),
      number("keyBytes", "密钥长度（字节）", 32, { min: 4, max: 128 }),
      select("digest", "摘要算法", "SHA256", ["SHA1", "SHA224", "SHA256", "SHA384", "SHA512"].map((v) => option(v, v))),
      select("outputFormat", "输出格式", "hex", formatOptions)
    ]
  }
];

export function getAlgorithm(id) {
  return algorithms.find((algorithm) => algorithm.id === id) || algorithms[0];
}

export function defaultConfig(algorithm) {
  return Object.fromEntries((algorithm.fields || []).map((field) => [field.id, field.defaultValue]));
}
