import { isFieldVisible } from "../core/validation.js";

export function renderActions(container, algorithm, selectedAction, onSelect) {
  container.replaceChildren();
  for (const action of algorithm.actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-option";
    button.textContent = action.label;
    button.setAttribute("aria-pressed", String(action.id === selectedAction));
    button.addEventListener("click", () => onSelect(action.id));
    container.append(button);
  }
}

export function renderConfigForm(container, algorithm, action, values, errors, onChange) {
  container.replaceChildren();
  for (const field of algorithm.fields || []) {
    if (!isFieldVisible(field, action, values)) continue;
    const wrapper = document.createElement("label");
    wrapper.className = `field${field.wide ? " field-wide" : ""}${field.type === "checkbox" ? " checkbox-field" : ""}`;
    const label = document.createElement("span");
    label.className = "field-label";
    label.textContent = field.label;
    const control = createControl(field, values[field.id]);
    control.id = `config-${field.id}`;
    control.dataset.field = field.id;
    if (errors[field.id]) control.setAttribute("aria-invalid", "true");

    const update = () => {
      values[field.id] = field.type === "checkbox" ? control.checked : control.value;
      onChange(field, values[field.id]);
    };
    control.addEventListener(field.type === "text" || field.type === "password" || field.type === "number" ? "input" : "change", update);

    if (field.type === "checkbox") wrapper.append(control, label);
    else if (field.type === "password") wrapper.append(label, passwordControl(control));
    else wrapper.append(label, control);

    if (errors[field.id]) {
      const error = document.createElement("p");
      error.className = "field-error";
      error.textContent = errors[field.id];
      wrapper.append(error);
    } else if (field.help) {
      const help = document.createElement("p");
      help.className = "field-help";
      help.textContent = field.help;
      wrapper.append(help);
    }
    container.append(wrapper);
  }
}

function createControl(field, value) {
  if (field.type === "select") {
    const select = document.createElement("select");
    for (const item of field.options) {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      select.append(option);
    }
    select.value = value;
    return select;
  }
  const input = document.createElement("input");
  input.type = field.type;
  if (field.type === "checkbox") input.checked = Boolean(value);
  else input.value = value ?? "";
  if (field.min !== undefined) input.min = field.min;
  if (field.max !== undefined) input.max = field.max;
  if (field.autocomplete) input.autocomplete = field.autocomplete;
  return input;
}

function passwordControl(input) {
  const wrapper = document.createElement("span");
  wrapper.className = "password-control";
  const reveal = document.createElement("button");
  reveal.type = "button";
  reveal.className = "reveal-button";
  reveal.textContent = "显示";
  reveal.setAttribute("aria-label", "显示敏感字段内容");
  reveal.addEventListener("click", () => {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    reveal.textContent = hidden ? "隐藏" : "显示";
    reveal.setAttribute("aria-label", hidden ? "隐藏敏感字段内容" : "显示敏感字段内容");
  });
  wrapper.append(input, reveal);
  return wrapper;
}
