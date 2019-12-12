// import { SQLBuilder } from './';



// const sum = (a, b) => a + b;
// test('lalatest', () => {
//   //expect(sum(1, 1)).toBe(3);

//   const selectExprListBuilder = {
//     name: '_name',
//     surname: null,
//     email: 'email',
//     friendsKeys() { return '(SELECT id FROM friends WHERE person_1 = id)'; },
//     school: { schoolId: 'school_id', city: null },
//     city({ cityId = 1 }) { return [`(SELECT name FROM cities WHERE id = ?)`, cityId]; },
//   };
  
//   const whereConditionBuilder = {
//     name: '_name',
//     middlename: 'middlename1',
//     //surname: null,
//     cityId(cityId) { return [`city_id != ?`, cityId]; },
//     schoolId(schoolId) { return [`schoolId != ?`, schoolId]; },
//   };
  
//   const assignmentListBuilder = {
//     name: '_name',
//     //surname: null,
//     async schoolId({ schoolId }) { return ['school_id = ?, city_id = (SELECT city_id FROM schools WHERE school_id = ?)', schoolId, schoolId]; }
//   };
  
//   const sqlBuilder = new SQLBuilder(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder);
//   const whereClause = sqlBuilder.buildWhereClause({ name: 'lalala', middlename: ['eee1', 'uuu1'], surname: ['eee', 'uuu'], email: 'qwerty', cityId: 2, schoolId: ['1', 'a'] });
//   //console.log(whereClause);

//   expect(whereClause).toEqual([
//     'WHERE (name = ?) AND (middlename IN (?, ?)) AND (surname IN (?, ?)) AND (email = ?) AND (city_id != ?) AND (schoolId != ?)',
//     ['lalala', 'eee1', 'uuu1', 'eee', 'uuu', 'qwerty', 2, ['1', 'a'] |> JSON.stringify]
//   ]);

// });

// // const selectExprList = sqlBuilder.buildSelectExprList({ name: {}, surname: null, email: null, cityId: 'city_id', school: { name: null, pupleCount: {} }, city: null }, { cityId: 2 });
// // const whereClause = sqlBuilder.buildWhereClause({ name: 'lalala', surname: ['eee', 'uuu'], email: 'qwerty', cityId: 2 });
// // console.log(selectExprList);
// // console.log(whereClause);
// // (async function lalala () {
// //   const assignmentList = await sqlBuilder.buildAssignmentList({ name: 'lalala', surname: 'tututu', email: 'asdfgh', schoolId: 3 });
// //   console.log(assignmentList);
// // })()

// const whereBuilder = {
//   prop1: '_prop1',
//   prop2: name => ['name = ?', name],
//   // prop3: (name1, name2) => [
//   //   plh => [`name1 = ${plh}`, name1],
//   //   plh => [`name2 = ${plh}`, name2]
//   // ],
//   prop4: (name1, name2) => [
//     [fill => `name1 = ${fill('?', ', ')}`, name1],
//     [ph => `name2 = ${ph}`, name2]
//   ],
//   email: value => `email = '${value}'`,
//   keys: values => `id IN (${values.join(', ')})`,
//   fullnameSearch: values => values.split(' ').map(value => `(firstname LIKE '%${value}%') OR lastname LIKE '%${value}%')`).join(' AND '),

// };

// const arr = [1, 2, 3];
// console.log(arr.map(() => '?').join(', '));

// import { Pool } from '../database/Pool';

// const dbConfig = {
//   host: 'localhost',
//   user: 'root',
//   password: 'keepthefaith',
//   database: 'openedu',
//   port: 3306,
//   multipleStatements: true   '       \'
// };

// const pool = new Pool(dbConfig);

//let name = 'course';
let name = `course%'; \ SELECT'' \\' sd ' \ \\ * FROM users; % \n \\n SELECT * FROM course_design_templates WHERE _name LIKE \\'%course`;
console.log(name |> JSON.stringify);
console.log(name);
name = name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
//name = name.match(/[^\\]'/g);
const res = name.match(/^(?!\\)(')/g);

console.log(name);
//console.log(res);

// async function test() {
  
//   const db = await pool.getConnection();
//   const courses = await db.query(`SELECT * FROM course_design_templates WHERE _name LIKE '%${name}%';`);
//   db.end();
//   console.log(courses);
// }

// test();