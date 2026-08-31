const PREFIX = "[Encode/Decode]";

export function logAppReady({ algorithmCount, selectedAlgorithm }) {
  console.info(`${PREFIX} 应用已就绪`, { algorithmCount, selectedAlgorithm });
}

export function logAlgorithmSelection({ from, to, category }) {
  console.info(`${PREFIX} 切换算法`, { from, to, category });
}

export function logActionSelection({ algorithm, from, to }) {
  console.info(`${PREFIX} 切换操作`, { algorithm, from, to });
}

export function logThemeChange({ theme, source }) {
  console.info(`${PREFIX} 应用主题`, { theme, source });
}

export function logValidationFailure({ algorithm, action, fields }) {
  console.warn(`${PREFIX} 配置校验失败`, { algorithm, action, invalidFields: fields });
}

export function logStart({ algorithm, action, inputLength, inputBytes, executionTarget, config }) {
  console.group(`${PREFIX} 执行 ${algorithm} · ${action}`);
  console.info("任务", { algorithm, action, executionTarget });
  console.info("输入统计", { characters: inputLength, utf8Bytes: inputBytes });
  console.info("配置（敏感字段已脱敏）", config);
}

export function logSuccess({ outputLength, duration }) {
  console.info("执行完成", { outputCharacters: outputLength, durationMs: Number(duration.toFixed(2)) });
  console.groupEnd();
}

export function logFailure(diagnostic) {
  console.error("执行失败", diagnostic);
  console.groupEnd();
}

export function installGlobalErrorLogging() {
  window.addEventListener("error", (event) => {
    console.error(`${PREFIX} 未捕获异常`, event.error || event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    console.error(`${PREFIX} 未处理的 Promise 异常`, event.reason);
  });
}
