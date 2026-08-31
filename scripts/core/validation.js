export function isFieldVisible(field, action, values) {
  if (field.actions && !field.actions.includes(action)) return false;
  if (!field.when) return true;
  return field.when({ action, values });
}

export function validateConfig(algorithm, action, values) {
  const errors = {};
  for (const field of algorithm.fields || []) {
    if (!isFieldVisible(field, action, values)) continue;
    const value = values[field.id];
    if (field.required && (value === "" || value === null || value === undefined)) {
      errors[field.id] = `请填写${field.label}`;
      continue;
    }
    if (field.type === "number" && value !== "" && value !== undefined) {
      const number = Number(value);
      if (!Number.isFinite(number)) errors[field.id] = `${field.label}必须是数字`;
      else if (field.min !== undefined && number < field.min) errors[field.id] = `${field.label}不能小于 ${field.min}`;
      else if (field.max !== undefined && number > field.max) errors[field.id] = `${field.label}不能大于 ${field.max}`;
    }
    if (!errors[field.id] && field.validate) {
      const message = field.validate(value, values, action);
      if (message) errors[field.id] = message;
    }
  }
  return errors;
}

export function redactConfig(algorithm, values) {
  const sensitive = new Set((algorithm.fields || []).filter((field) => field.secret).map((field) => field.id));
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, sensitive.has(key) ? "[REDACTED]" : value]));
}
