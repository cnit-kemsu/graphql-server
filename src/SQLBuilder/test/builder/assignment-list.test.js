import { SQLBuilder } from '../../';
import { escape } from '../../escape';
import { setJSON } from '../../sql-json';

//
// invalid constructor
//

test(`Invalid type of builder`, () => {
  const _assignmentListBuilder = {
    email: `email = 'john@email.com'`
  };
  expect(() => new SQLBuilder({}, {}, _assignmentListBuilder))
    .toThrowError(`The assignment builder 'email' must be an instance of 'Function' or 'AsyncFunction', but it is of type 'string'.`);
});

//
// valid constructor
//

const assignmentListBuilder = {
  email: async value => await `_email = ${escape(value)}`,
  data: value => setJSON('_data', value),
  summary: value => `summary_value_id = set_value(summary_value_id, ${escape(value)}, NULL)`,
  _error: () => {
    throw new Error('Test error');
  },
  _invalid: async () => await []
};
const sqlBuilder = new SQLBuilder({}, {}, assignmentListBuilder);

//
// invalid arguments
//

it(`Invalid type of the first argument`, async () => {
  try {
    await sqlBuilder.buildAssignmentList(1);
  } catch (error) {
    expect(error.message).toBe(`The first argument to the assignment builder must be an instance of 'Object', but it is of type 'number'.`);
  }
});

it(`Invalid name of builder`, async () => {
  try {
    await sqlBuilder.buildAssignmentList({ description: 5 });
  } catch (error) {
    expect(error.message).toBe(`An assignment builder 'description' does not exist.`);
  }
});

//
// invalid builders
//

it(`An error occurs inside builder`, async () => {
  try {
    await sqlBuilder.buildAssignmentList({ _error: 1 });
  } catch (error) {
    expect(error.message).toBe(`An error occurred in the assignment builder '_error'. Test error`);
  }
});

it(`Invalid type of value returned by builder`, async () => {
  try {
    await sqlBuilder.buildAssignmentList({ _invalid: 1 });
  } catch (error) {
    expect(error.message).toBe(`An error occurred in the assignment builder '_invalid'. The returned result must be of type 'string', but it is an instance of 'Array'.`);
  }
});

//
// valid results
//

it(`Test result #1`, async () => {
  await sqlBuilder.buildAssignmentList({ email: 'john@email.com' })
  |> expect(#).toBe(`_email = "john@email.com"`);
});

it(`Test result #2`, async () => {
  await sqlBuilder.buildAssignmentList({ data: { firstname: 'john', lastname: 'cooper' }, summary: `'john' "cooper"` })
  |> expect(#).toBe(`_data = JSON_SET(IF(_data IS NULL, '{}', _data), '$.firstname', "john", '$.lastname', "cooper"), summary_value_id = set_value(summary_value_id, "'john' \\"cooper\\"", NULL)`);
});


it(`Test result #3`, async () => {
  await sqlBuilder.buildAssignmentList({ email: 'john@email.com', data: { firstname: null, lastname: `'text' "text"` }, summary: 'text...' })
  |> expect(#).toBe(`_email = "john@email.com", _data = JSON_SET(IF(_data IS NULL, '{}', _data), '$.firstname', NULL, '$.lastname', "'text' \\"text\\""), summary_value_id = set_value(summary_value_id, "text...", NULL)`);
});