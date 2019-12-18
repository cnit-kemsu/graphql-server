function escape(value) {
  if (value === null) return 'NULL';
  return JSON.stringify(value);
}

export function getJSON(columnName, propName) {
  return `JSON_VALUE(${columnName}, '$.${propName}')`;
}

export function setJSON(columnName, jsonObject) {
  
  const values = [];
  for (const key in jsonObject) {
    const value = jsonObject[key];
    if (value !== undefined) values.push(`'$.${key}', ${escape(value)}`);
  }
  if (values.length === 0) return;

  return `${columnName} = JSON_SET(IF(${columnName} IS NULL, '{}', ${columnName}), ${values.join(', ')})`;
}

export function jsonArray(cols) {
  return `CONCAT('[', GROUP_CONCAT(${cols} SEPARATOR ', '), ']')`;
}