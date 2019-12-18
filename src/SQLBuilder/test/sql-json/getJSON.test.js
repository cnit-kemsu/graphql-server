import { getJSON } from '../../sql-json';

test(`Invalid first argument`, () => {
  expect(() => getJSON()).toThrowError(`The first argument to getJSON function must be of type 'string', but it is 'undefined'.`);
});

test(`Invalid second argument`, () => {
  expect(() => getJSON('_data', [])).toThrowError(`The second argument to getJSON function must be of type 'string', but it is an instance of 'Array'.`);
});

test(`Test result`, () => {
  getJSON('_data', 'firstname')
  |> expect(#).toBe(`JSON_VALUE(_data, '$.firstname')`);
});