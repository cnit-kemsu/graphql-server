export function escape(value) {
  if (value === null) return 'NULL';
  return JSON.stringify(value);
}

export function escapePattern(value, pattern) {
  return value.replace(/(%|_)/g, '$1$1')
  |> pattern
  |> JSON.stringify
  |> #.replace(/%%/g, '\\%')
  |> #.replace(/__/g, '\\_');
}

const pattern = word =>  `%${word}%`;
escapePattern(`a%sd`, pattern) |> console.log;

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