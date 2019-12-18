import { SQLBuilder } from './';
import { escape, escapePattern } from './escape';
import { getJSON, setJSON } from './sql-json';

//
// invalid constructor
//

// invalid select expression list builder

test(`Invalid type of select expression builder`, () => {
  const _selectExprListBuilder = {
    id: null
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`The select expression builder named 'id' must be of type 'string' or an instance of 'Array' or 'Function', but it is 'null'.`);
});

test(`Invalid select expression builder: invalid type of name of requested builder`, () => {
  const _selectExprListBuilder = {
    id: 'id',
    friends: [() => {}]
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`Invalid select expression builder named 'friends'. The requested builder name with index '0' must be of type 'string', but it is an instance of 'Function'.`);
});

test(`Invalid select expression builder: invalid name of requested builder`, () => {
  const _selectExprListBuilder = {
    id: 'id',
    friends: ['id', 'description']
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`Invalid select expression builder named 'friends'. The requested builder named 'description' does not exist.`);
});

test(`Invalid select expression builder: invalid type of requested builder`, () => {
  const _selectExprListBuilder = {
    id: 'id',
    friends: ['id'],
    children: ['friends']
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`Invalid select expression builder named 'children'. The requested builder named 'friends' cannot be the builder that is an instance of 'Array'.`);
});

// invalid where condition builder

test(`Invalid type of predicate builder`, () => {
  const _whereConditionBuilder = {
    email: 1
  };
  expect(() => new SQLBuilder({}, _whereConditionBuilder))
    .toThrowError(`The predicate builder named 'email' must be an instance of 'Function', but it is of type 'number'.`);
});

// invalid assignment list builder

test(`Invalid type of assignment builder`, () => {
  const _assignmentListBuilder = {
    email: `email = 'john@email.com'`
  };
  expect(() => new SQLBuilder({}, {}, _assignmentListBuilder))
    .toThrowError(`The assignment builder named 'email' must be an instance of 'Function' or 'AsyncFunction', but it is of type 'string'.`);
});

//
// invalid arguments
//

const selectExprListBuilder = {
  id: 'id',
  firstname: getJSON('_date', 'firstname'),
  lastname: getJSON('_date', 'lastname'),
  email: '_email',
  summary: 'get_value(summary_value_id)',
  friends: ['id'],
  _error: () => {
    throw new Error('Test error');
  },
  _invalid: () => 1
};

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

const assignmentListBuilder = {
  email: async value => await `_email = ${escape(value)}`,
  data: value => setJSON('_data', value),
  summary: value => `summary_value_id = set_value(summary_value_id, ${escape(value)}, NULL)`,
  _error: () => {
    throw new Error('Test error');
  },
  _invalid: async () => await []
};

const sqlBuilder = new SQLBuilder(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder);

// invalid arguments to build select expression list method

test(`Invalid type of the first argument to the method named 'buildSelectExprList'`, () => {
  expect(() => sqlBuilder.buildSelectExprList([1]))
    .toThrowError(`The first argument to the method 'buildSelectExprList' must be an instance of 'Object', but it is an instance of 'Array'.`);
});

test(`Invalid type of requested field`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ id: 5 }))
    .toThrowError(`The requested field named 'id' must be value of 'null' or an instance of 'Object', but it is of type 'number'.`);
});

test(`Invalid name of requested field`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ children: null }))
    .toThrowError(`A select expression builder named 'children' does not exist.`);
});

// invalid arguments to build where clause method

test(`Invalid type of the first argument to the method named 'buildWhereClause'`, () => {
  expect(() => sqlBuilder.buildWhereClause([1, 2]))
    .toThrowError(`The first argument to the method 'buildWhereClause' must be an instance of 'Object', but it is an instance of 'Array'.`);
});

test(`Invalid type of the second argument to the method named 'buildWhereClause'`, () => {
  expect(() => sqlBuilder.buildWhereClause({}, `_email = 'john@email.com'`))
    .toThrowError(`The second argument to the method 'buildWhereClause' must be an instance of 'Array', but it is of type 'string'.`);
});

test(`Invalid type of extra predicate`, () => {
  expect(() => sqlBuilder.buildWhereClause({ email: 'john@email.com' }, ['id = 5', async () => {}]))
    .toThrowError(`An extra predicate with index '1' must be of type 'string', but it is an instance of 'AsyncFunction'.`);
});

// invalid arguments to assignment list method

it(`Invalid type of the first argument to the method named 'buildAssignmentList'`, async () => {
  try {
    await sqlBuilder.buildAssignmentList(1);
  } catch (error) {
    expect(error.message).toBe(`The first argument to the method 'buildAssignmentList' must be an instance of 'Object', but it is of type 'number'.`);
  }
});

it(`Invalid name of assignment builder`, async () => {
  try {
    await sqlBuilder.buildAssignmentList({ description: 5 });
  } catch (error) {
    expect(error.message).toBe(`An assignment builder named 'description' does not exist.`);
  }
});

// tests results of select expression list builder

test(`An error occurs inside select expression builder`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ _error: null }))
    .toThrowError(`An error occurred while trying to build a select expression for a field named '_error'. Test error`);
});

test(`Invalid type of value returned by select expression builder`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ _invalid: null }))
    .toThrowError(`An error occurred while trying to build a select expression for a field named '_invalid'. The result returned by the select expression builder must be of type 'string', but it is of type 'number'.`);
});

test(`Test select expression list builder 1`, () => {
  expect(sqlBuilder.buildSelectExprList({ id: null, firstname: null, email: null }))
    .toBe(`id, JSON_VALUE(_date, '$.firstname') AS firstname, _email AS email`);
});

test(`Test select expression list builder 2`, () => {
  expect(sqlBuilder.buildSelectExprList({ firstname: null, lastname: null, friends: { name: null } }))
    .toBe(`JSON_VALUE(_date, '$.firstname') AS firstname, JSON_VALUE(_date, '$.lastname') AS lastname, id`);
});

test(`Test select expression list builder 3`, () => {
  expect(sqlBuilder.buildSelectExprList({ id: null, friends: {}, summary: { name: {} } }))
    .toBe(`id, get_value(summary_value_id) AS summary`);
});

// tests results of where clause builder

test(`An error occurs inside where condition builder`, () => {
  expect(() => sqlBuilder.buildWhereClause({ _error: 1 }))
    .toThrowError(`An error occurred while trying to build a predicate for a filter named '_error'. Test error`);
});

test(`Invalid type of value returned by where condition builder`, () => {
  expect(() => sqlBuilder.buildWhereClause({ _invalid: 1 }))
    .toThrowError(`An error occurred while trying to build a predicate for a filter named '_invalid'. The result returned by the predicate builder must be of type 'string', but it is an instance of 'Object'.`);
});

test(`Test where clause builder 1`, () => {
  expect(sqlBuilder.buildWhereClause({ email: 'john@email.com', keys: [1, 2], searchText: undefined }))
    .toBe(`WHERE (_email = "john@email.com") AND (id IN (1, 2))`);
});

test(`Test where clause builder 2`, () => {
  expect(sqlBuilder.buildWhereClause({ email: null, keys: [], searchText: `"co\\op%er\\"  '\\%\\_j_'` }))
    .toBe(`WHERE (_email = NULL) AND ((firstname LIKE "%\\"co\\\\op\\%er\\\\\\"%" OR lastname LIKE "%\\"co\\\\op\\%er\\\\\\"%") AND (firstname LIKE "%'\\\\\\%\\\\\\_j\\_'%" OR lastname LIKE "%'\\\\\\%\\\\\\_j\\_'%"))`);
});

// tests results of assignment list builder

it(`An error occurs inside assignment builder`, async () => {
  try {
    await sqlBuilder.buildAssignmentList({ _error: 1 });
  } catch (error) {
    expect(error.message).toBe(`An error occurred while trying to build an assignment for an input argument named '_error'. Test error`);
  }
});

it(`Invalid type of value returned by assignment builder`, async () => {
  try {
    await sqlBuilder.buildAssignmentList({ _invalid: 1 });
  } catch (error) {
    expect(error.message).toBe(`An error occurred while trying to build an assignment for an input argument named '_invalid'. The result returned by the assignment builder must be of type 'string', but it is an instance of 'Array'.`);
  }
});

it(`Test assignment builder 1`, async () => {
  await sqlBuilder.buildAssignmentList({ email: 'john@email.com' })
  |> expect(#).toBe(`_email = "john@email.com"`);
});

it(`Test assignment builder 2`, async () => {
  await sqlBuilder.buildAssignmentList({ data: { firstname: 'john', lastname: 'cooper' }, summary: `'john' "cooper"` })
  |> expect(#).toBe(`_data = JSON_SET(IF(_data IS NULL, '{}', _data), '$.firstname', "john", '$.lastname', "cooper"), summary_value_id = set_value(summary_value_id, "'john' \\"cooper\\"", NULL)`);
});


it(`Test assignment builder 3`, async () => {
  await sqlBuilder.buildAssignmentList({ email: 'john@email.com', data: { firstname: null, lastname: `'text' "text"` }, summary: 'text...' })
  |> expect(#).toBe(`_email = "john@email.com", _data = JSON_SET(IF(_data IS NULL, '{}', _data), '$.firstname', NULL, '$.lastname', "'text' \\"text\\""), summary_value_id = set_value(summary_value_id, "text...", NULL)`);
});