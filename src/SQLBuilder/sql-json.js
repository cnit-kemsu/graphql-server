export { escape } from './escape';

export function getJSON(columnName, propName) {
  
  return `JSON_VALUE(${columnName}, '$.${propName}')`;
}

export function setJSON(columnName, jsonObject) {
  
  let values = '';
  for (const key in jsonObject) {
    const value = jsonObject[key];
    if (value !== undefined) values += `, '$.${key}', ${escape(value)}`;
  }
  if (values === '') return;

  return [`${columnName} = JSON_SET(IF(${columnName} IS NULL, '{}', ${columnName})${values})`];
}

//
export function jsonArray(cols) {
  return `CONCAT('[', GROUP_CONCAT(${cols} SEPARATOR ', '), ']')`;
}