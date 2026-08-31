import { categoryOrder } from "../algorithms/catalog.js";

export function renderAlgorithmNav(container, algorithms, selectedId, query, onSelect) {
  container.replaceChildren();
  const normalized = query.trim().toLocaleLowerCase();
  const visible = algorithms.filter((algorithm) => {
    const haystack = `${algorithm.title} ${algorithm.description} ${algorithm.category} ${(algorithm.badges || []).join(" ")}`.toLocaleLowerCase();
    return !normalized || haystack.includes(normalized);
  });

  for (const category of categoryOrder) {
    const items = visible.filter((algorithm) => algorithm.category === category);
    if (!items.length) continue;
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.className = "nav-group-title";
    heading.textContent = category;
    const list = document.createElement("div");
    list.className = "nav-items";
    for (const algorithm of items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nav-item";
      button.dataset.algorithm = algorithm.id;
      button.setAttribute("aria-current", String(algorithm.id === selectedId));
      const icon = document.createElement("span");
      icon.className = "nav-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = algorithm.icon;
      const label = document.createElement("span");
      label.textContent = algorithm.title;
      button.append(icon, label);
      button.addEventListener("click", () => onSelect(algorithm.id));
      list.append(button);
    }
    section.append(heading, list);
    container.append(section);
  }
  return visible.length;
}

export function renderMobilePicker(select, algorithms, selectedId) {
  select.replaceChildren();
  for (const category of categoryOrder) {
    const group = document.createElement("optgroup");
    group.label = category;
    for (const algorithm of algorithms.filter((item) => item.category === category)) {
      const option = document.createElement("option");
      option.value = algorithm.id;
      option.textContent = algorithm.title;
      group.append(option);
    }
    select.append(group);
  }
  select.value = selectedId;
}
