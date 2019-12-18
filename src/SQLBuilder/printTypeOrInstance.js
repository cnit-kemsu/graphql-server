export function printTypeOrInstance(value) {
  if (value === undefined) return `'undefined'`;
  if (value === null) return `'null'`;
  return value instanceof Object ? `an instance of '${value.constructor.name}'`: `of type '${typeof value}'`;
}
