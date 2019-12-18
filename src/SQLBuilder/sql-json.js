import { escape } from './escape';
import { printTypeOrInstance } from './printTypeOrInstance';

/**
 * @param {string} columnName 
 * @param {string} propName 
 */
export function getJSON(columnName, propName) {
  if (typeof columnName !== 'string') throw TypeError(`The first argument to getJSON function must be of type 'string', but it is ${printTypeOrInstance(columnName)}.`);
  if (typeof propName !== 'string') throw TypeError(`The second argument to getJSON function must be of type 'string', but it is ${printTypeOrInstance(propName)}.`);
  return `JSON_VALUE(${columnName}, '$.${propName}')`;
}

/**
 * @param {string} columnName 
 * @param {{}} jsonObject 
 */
export function setJSON(columnName, jsonObject) {
  if (typeof columnName !== 'string') throw TypeError(`The first argument to setJSON function must be of type 'string', but it is ${printTypeOrInstance(columnName)}.`);
  if (jsonObject?.constructor !== Object) throw TypeError(`The second argument to setJSON function must be an instance of 'Object', but it is ${printTypeOrInstance(jsonObject)}.`);
  
  const values = [];
  for (const key in jsonObject) {
    const value = jsonObject[key];
    if (value !== undefined) values.push(`'$.${key}', ${escape(value)}`);
  }
  if (values.length === 0) return;

  return `${columnName} = JSON_SET(IF(${columnName} IS NULL, '{}', ${columnName}), ${values.join(', ')})`;
}