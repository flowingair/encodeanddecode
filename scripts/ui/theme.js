import { loadSetting, saveSetting } from "../core/storage.js";
import { logThemeChange } from "../core/logger.js";

const VALID_THEMES = new Set(["system", "light", "dark"]);

export function setupTheme(select) {
  let theme = loadSetting("theme", "system");
  if (!VALID_THEMES.has(theme)) theme = "system";
  select.value = theme;
  applyTheme(theme);
  logThemeChange({ theme, source: "initial" });
  select.addEventListener("change", () => {
    applyTheme(select.value);
    saveSetting("theme", select.value);
    logThemeChange({ theme: select.value, source: "user" });
  });
}

function applyTheme(theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
}
