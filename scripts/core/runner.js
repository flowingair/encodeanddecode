import { executeAdapter } from "../algorithms/adapters.js";
import { AppError, normalizeError } from "./errors.js";
import { logStart, logSuccess, logFailure } from "./logger.js";
import { redactConfig } from "./validation.js";
import { loadAlgorithmDependencies } from "./dependency-loader.js";

export const LARGE_INPUT_BYTES = 128 * 1024;

export async function runAlgorithm(algorithm, action, input, config) {
  const startedAt = performance.now();
  const context = { algorithm: algorithm.id, action, inputLength: input.length, stage: "execute" };
  const inputBytes = new TextEncoder().encode(input).length;
  const useWorker = Boolean(algorithm.worker) || inputBytes >= LARGE_INPUT_BYTES;
  logStart({ ...context, inputBytes, executionTarget: useWorker ? "worker" : "main", config: redactConfig(algorithm, config) });

  try {
    const rawOutput = useWorker
      ? await runInWorker(algorithm, action, input, config)
      : await runOnMainThread(algorithm.id, action, input, config);
    if (rawOutput === undefined || rawOutput === null) throw new AppError("EMPTY_RETURN", "算法没有返回结果。", { details: "Adapter returned null or undefined." });
    const output = String(rawOutput);
    const duration = performance.now() - startedAt;
    logSuccess({ outputLength: output.length, duration });
    return { output, duration, executionTarget: useWorker ? "worker" : "main" };
  } catch (sourceError) {
    const normalized = normalizeError(sourceError, context);
    logFailure(normalized.diagnostic);
    throw normalized;
  }
}

async function runOnMainThread(algorithmId, action, input, config) {
  await loadAlgorithmDependencies(algorithmId, config);
  return executeAdapter(algorithmId, action, input, config);
}

function runInWorker(algorithm, action, input, config) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/algorithm-worker.js", import.meta.url));
    const configuredTimeout = Number(config.timeout);
    const timeout = Number.isFinite(configuredTimeout) ? configuredTimeout : algorithm.timeout || 30000;
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new AppError("EXECUTION_TIMEOUT", `执行超过 ${timeout} 毫秒，已自动终止。`));
    }, timeout);

    worker.addEventListener("message", ({ data }) => {
      clearTimeout(timer);
      worker.terminate();
      if (data.ok) resolve(data.output);
      else reject(new AppError(data.code || "WORKER_FAILED", data.message || "Worker 执行失败。", { details: data.details }));
    }, { once: true });
    worker.addEventListener("error", (event) => {
      clearTimeout(timer);
      worker.terminate();
      reject(new AppError("WORKER_CRASHED", "隔离执行环境发生异常。", { details: `${event.message} (${event.filename}:${event.lineno})` }));
    }, { once: true });
    worker.postMessage({ algorithmId: algorithm.id, action, input, config });
  });
}
