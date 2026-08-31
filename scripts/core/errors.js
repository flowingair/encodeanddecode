export class AppError extends Error {
  constructor(code, message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.details = options.details || "";
    this.field = options.field || "";
  }
}

export function normalizeError(error, context = {}) {
  const source = error instanceof Error ? error : new Error(String(error));
  const known = source instanceof AppError;
  const normalized = known
    ? source
    : new AppError("EXECUTION_FAILED", friendlyMessage(source), { cause: source });

  const diagnostic = {
    code: normalized.code,
    algorithm: context.algorithm || "unknown",
    action: context.action || "unknown",
    stage: context.stage || "execute",
    inputLength: context.inputLength ?? 0,
    time: new Date().toISOString(),
    error: source.name,
    message: source.message,
    details: normalized.details || undefined,
    stack: source.stack || undefined
  };

  return { error: normalized, diagnostic };
}

function friendlyMessage(error) {
  if (error instanceof URIError) return "输入中包含无效的 URL 转义序列。";
  if (/Malformed UTF-8/i.test(error.message)) return "解密或解码结果不是有效的 UTF-8 文本，请检查密钥和配置。";
  if (/InvalidCharacterError/i.test(error.name)) return "输入包含当前编码不接受的字符。";
  return "算法执行时发生异常，请检查输入和配置。";
}

export function formatDiagnostic(diagnostic) {
  return Object.entries(diagnostic)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}
