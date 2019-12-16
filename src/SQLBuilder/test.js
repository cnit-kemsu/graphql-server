import { SQLBuilder } from './';
import { escape, escapePattern } from './escape';
import { getJSON, setJSON } from './sql-json';

const selectExprListBuilder = {
  firstname: getJSON('_date', 'firstname'),
  lastname: getJSON('_date', 'lastname'),
  email: '_email',
  summary: 'get_value(summary_value_id)',
  friends: ['id']
};

function searchWord(word) {
  return `%${escapePattern(word)}%`
  |> escape
  |> `(firstname LIKE ${#}) OR lastname LIKE ${#})`;
}

const whereConditionBuilder = {
  email: value => `_email = ${escape(value)}`,
  keys: values => `id IN (${values.join(', ')})`,
  searchText: text => text
    .trim().replace(/\s{2,}/g, '')
    .split(' ')
    .map(searchWord)
    .join(' AND ')

};

const assignmentListBuilder = {
  email: value => `_email = ${escape(value)}`,
  data: value => setJSON('_data', value),
  summary: value => `summary_value_id = set_value(id, ${escape(value)}, NULL)`
};

test('test', () => {
  
  const sqlBuilder = new SQLBuilder(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder);
  const whereClause = sqlBuilder.buildWhereClause({ name: 'lalala', middlename: ['eee1', 'uuu1'], surname: ['eee', 'uuu'], email: 'qwerty', cityId: 2, schoolId: ['1', 'a'] });
  //console.log(whereClause);

  expect(whereClause).toEqual([
    'WHERE (name = ?) AND (middlename IN (?, ?)) AND (surname IN (?, ?)) AND (email = ?) AND (city_id != ?) AND (schoolId != ?)',
    ['lalala', 'eee1', 'uuu1', 'eee', 'uuu', 'qwerty', 2, ['1', 'a'] |> JSON.stringify]
  ]);

});

// const selectExprList = sqlBuilder.buildSelectExprList({ name: {}, surname: null, email: null, cityId: 'city_id', school: { name: null, pupleCount: {} }, city: null }, { cityId: 2 });
// const whereClause = sqlBuilder.buildWhereClause({ name: 'lalala', surname: ['eee', 'uuu'], email: 'qwerty', cityId: 2 });
// console.log(selectExprList);
// console.log(whereClause);
// (async function lalala () {
//   const assignmentList = await sqlBuilder.buildAssignmentList({ name: 'lalala', surname: 'tututu', email: 'asdfgh', schoolId: 3 });
//   console.log(assignmentList);
// })()

