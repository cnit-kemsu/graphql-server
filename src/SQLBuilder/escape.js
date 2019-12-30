import { printTypeOrInstance } from './printTypeOrInstance';

/**
 * @param {any} value 
 */
export function escape(value) {
  if (value === null) return 'NULL';
  return JSON.stringify(value);
}

/**
 * @param {string} value 
 * @param {Function} pattern 
 */
export function escapePattern(value, pattern) {

  if (typeof value !== 'string') throw TypeError(`The first argument to escapePattern function must be of type 'string', but it is ${printTypeOrInstance(value)}.`);
  const _temp = value.replace(/(%|_)/g, '?$1')
  |> pattern;

  if (typeof _temp !== 'string') throw TypeError(`Function that is the second argument to escapePattern function must return value of type 'string', but it is ${printTypeOrInstance(_temp)}.`);
  return JSON.stringify(_temp)
  |> #.replace(/\?(%|_)/g, '\\$1');
}

export function jsonToString(value) {
  if (value === null) return 'NULL';
  return JSON.stringify(value)
  |> JSON.stringify;
}

function _pad(value) {
  return ('0' + value).slice(-2);
}

/**
 * 
 * @param {Date} date 
 */
export function dateToString(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1) |> _pad;
  const _date = date.getDate() |> _pad;
  const hours = date.getHours() |> _pad;
  const minutes = date.getMinutes() |> _pad;
  const seconds = date.getSeconds() |> _pad;
  return `${year}-${month}-${_date} ${hours}:${minutes}:${seconds}`;
}

//.replace(/(?<!\\)'/g, '\\\''); // finds all `'` (but not `\'`) and replaces with `\'`
//.replace(/(\\|'|")/g, '\\$1'); // finds all `\`, `'` or `"` and adds `\` to it

//.replace('\'', '\\\''); // finds all `'` and replaces with `\'`
//.slice(1, str1.length - 1); // deletes first and last characters

//https://mariadb.com/kb/en/library/string-literals/

/**
 * \0
 * \'
 * \"
 * \b
 * \n
 * \r
 * \t
 * \Z
 * \\
 * \%
 * \_
 */