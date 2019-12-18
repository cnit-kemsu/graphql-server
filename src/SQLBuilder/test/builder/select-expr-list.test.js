import { SQLBuilder } from '../../';
import { getJSON } from '../../sql-json';

//
// invalid constructor
//

test(`Invalid type of builder`, () => {
  const _selectExprListBuilder = {
    id: null
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`The select expression builder 'id' must be of type 'string' or an instance of 'Array' or 'Function', but it is 'null'.`);
});

test(`Invalid type of requested builder`, () => {
  const _selectExprListBuilder = {
    id: 'id',
    friends: [() => {}]
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`Invalid select expression builder 'friends'. The requested builder with index '0' must be of type 'string', but it is an instance of 'Function'.`);
});

test(`Invalid name of requested builder`, () => {
  const _selectExprListBuilder = {
    id: 'id',
    friends: ['id', 'description']
  };
  expect(() => new SQLBuilder(_selectExprListBuilder))
    .toThrowError(`Invalid select expression builder 'friends'. The requested builder 'description' does not exist.`);
});

//
// valid constructor
//

const selectExprListBuilder = {
  id: 'id',
  firstname: getJSON('_data', 'firstname'),
  lastname: getJSON('_data', 'lastname'),
  email: '_email',
  summary: 'get_value(summary_value_id)',
  friends: ['id'],
  _error: () => {
    throw new Error('Test error');
  },
  _invalid: () => 1
};
const sqlBuilder = new SQLBuilder(selectExprListBuilder);

//
// invalid arguments
//

test(`Invalid type of the first argument`, () => {
  expect(() => sqlBuilder.buildSelectExprList([1]))
    .toThrowError(`The first argument to the select expression list builder must be an instance of 'Object', but it is an instance of 'Array'.`);
});

test(`Invalid type of requested field`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ id: 5 }))
    .toThrowError(`The requested field 'id' must be value of 'null' or an instance of 'Object', but it is of type 'number'.`);
});

test(`Invalid name of requested field`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ children: null }))
    .toThrowError(`A select expression builder 'children' does not exist.`);
});

//
// invalid builders
//

test(`An error occurs inside builder`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ _error: null }))
    .toThrowError(`An error occurred in the select expression builder '_error'. Test error`);
});

test(`Invalid type of value returned by builder`, () => {
  expect(() => sqlBuilder.buildSelectExprList({ _invalid: null }))
    .toThrowError(`An error occurred in the select expression builder '_invalid'. The returned result must be of type 'string', but it is of type 'number'.`);
});

//
// valid results
//

test(`Test result #1`, () => {
  expect(sqlBuilder.buildSelectExprList({ id: null, firstname: null, email: null }))
    .toBe(`id, JSON_VALUE(_data, '$.firstname') AS firstname, _email AS email`);
});

test(`Test result #2`, () => {
  expect(sqlBuilder.buildSelectExprList({ firstname: null, lastname: null, friends: { name: null } }))
    .toBe(`JSON_VALUE(_data, '$.firstname') AS firstname, JSON_VALUE(_data, '$.lastname') AS lastname, id`);
});

test(`Test result #3`, () => {
  expect(sqlBuilder.buildSelectExprList({ id: null, friends: {}, summary: { name: {} } }))
    .toBe(`id, get_value(summary_value_id) AS summary`);
});