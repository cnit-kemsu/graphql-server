import { SQLBuilder } from '../../';
import { escape, escapePattern } from '../../escape';

//
// invalid constructor
//

test(`Invalid type of builder`, () => {
  const _whereConditionBuilder = {
    email: 1
  };
  expect(() => new SQLBuilder({}, _whereConditionBuilder))
    .toThrowError(`The predicate builder 'email' must be an instance of 'Function', but it is of type 'number'.`);
});

//
// valid constructor
//

const pattern = word =>  `%${word}%`;
function searchWord(word) {
  return escapePattern(word, pattern)
  |> `(firstname LIKE ${#} OR lastname LIKE ${#})`;
}

const whereConditionBuilder = {
  email: value => `_email = ${escape(value)}`,
  keys: values => values.length > 0 ? `id IN (${values.join(', ')})` : null,
  searchText: text => text
    .trim().replace(/\s{2,}/g, ' ')
    .split(' ')
    .map(searchWord)
    .join(' AND '),
  _error: () => {
    throw new Error('Test error');
  },
  _invalid: () => ({})
};
const sqlBuilder = new SQLBuilder({}, whereConditionBuilder);

//
// invalid arguments
//

test(`Invalid type of the first argument`, () => {
  expect(() => sqlBuilder.buildWhereClause([1, 2]))
    .toThrowError(`The first argument to the where clause builder must be an instance of 'Object', but it is an instance of 'Array'.`);
});

test(`Invalid type of the second argument`, () => {
  expect(() => sqlBuilder.buildWhereClause({}, `_email = 'john@email.com'`))
    .toThrowError(`The second argument to the where clause builder must be an instance of 'Array', but it is of type 'string'.`);
});

test(`Invalid type of extra predicate`, () => {
  expect(() => sqlBuilder.buildWhereClause({ email: 'john@email.com' }, ['id = 5', async () => {}]))
    .toThrowError(`An extra predicate with index '1' must be of type 'string', but it is an instance of 'AsyncFunction'.`);
});

test(`Invalid name of builder`, () => {
  expect(() => sqlBuilder.buildWhereClause({ firstname: 'john' }))
    .toThrowError(`A predicate builder 'firstname' does not exist.`);
});

//
// invalid builders
//

test(`An error occurs inside builder`, () => {
  expect(() => sqlBuilder.buildWhereClause({ _error: 1 }))
    .toThrowError(`An error occurred in the predicate builder '_error'. Test error`);
});

test(`Invalid type of value returned by builder`, () => {
  expect(() => sqlBuilder.buildWhereClause({ _invalid: 1 }))
    .toThrowError(`An error occurred in the predicate builder '_invalid'. The returned result must be of type 'string', but it is an instance of 'Object'.`);
});

//
// valid results
//

test(`Test result #1`, () => {
  expect(sqlBuilder.buildWhereClause({ email: 'john@email.com', keys: [1, 2], searchText: undefined }))
    .toBe(`WHERE (_email = "john@email.com") AND (id IN (1, 2))`);
});

test(`Test result #2`, () => {
  expect(sqlBuilder.buildWhereClause({ email: null, keys: [], searchText: `_%"per j` }))
    .toBe(`WHERE (_email = NULL) AND ((firstname LIKE "%\\_\\%\\"per%" OR lastname LIKE "%\\_\\%\\"per%") AND (firstname LIKE "%j%" OR lastname LIKE "%j%"))`);
});