export function resolveJSON(value) {
  if (value == null) return undefined;
  return JSON.parse(value);
}