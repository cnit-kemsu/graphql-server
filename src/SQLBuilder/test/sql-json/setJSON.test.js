import { setJSON } from '../../sql-json';

test(`Invalid first argument`, () => {
  expect(() => setJSON(2)).toThrowError(`The first argument to setJSON function must be of type 'string', but it is of type 'number'.`);
});

test(`Invalid second argument`, () => {
  expect(() => setJSON('_data', null)).toThrowError(`The second argument to setJSON function must be an instance of 'Object', but it is 'null'.`);
});

test(`Test result`, () => {
  setJSON('_data', { name: 'john', surname: 'cooper' })
  |> expect(#).toBe(`_data = JSON_SET(IF(_data IS NULL, '{}', _data), '$.name', "john", '$.surname', "cooper")`);
});