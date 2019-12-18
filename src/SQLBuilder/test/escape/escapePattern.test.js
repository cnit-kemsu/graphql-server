import { escapePattern } from '../../escape';

test(`Invalid first argument`, () => {
  expect(() => escapePattern(null)).toThrowError(`The first argument to escapePattern function must be of type 'string', but it is 'null'.`);
});

test(`Invalid second argument`, () => {
  expect(() => escapePattern('john', () => 1)).toThrowError(`Function that is the second argument to escapePattern function must return value of type 'string', but it is of type 'number'.`);
});

test(`Test result`, () => {
  escapePattern(`"john" %_ 'cooper'`, str => `%${str}__`)
  |> expect(#).toBe(`"%\\"john\\" \\%\\_ 'cooper'__"`);
});