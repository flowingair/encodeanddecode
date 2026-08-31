const PREFIX = "encode-decode.";

export function loadSetting(key, fallback) {
  try { return localStorage.getItem(PREFIX + key) ?? fallback; }
  catch { return fallback; }
}

export function saveSetting(key, value) {
  try { localStorage.setItem(PREFIX + key, value); }
  catch (error) { console.warn("[Encode/Decode] 无法保存本地设置", { key, error }); }
}
