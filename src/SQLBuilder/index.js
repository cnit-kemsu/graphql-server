import graphqlFields from 'graphql-fields';

function colAsField([field, column]) {
  if (field === column) return column;
  return column + ' ' + field;
}

function toParams(params, [, value]) {
  return Array.isArray(value)
  ? [ ...params, ...value ]
  : [ ...params, value ];
}

function nonUndefined([, value]) {
  return value !== undefined;
}

function toParam([, value]) {
  return value instanceof Array ? value[1] : value;
}

function resolveSelectExpr(selectExprBuilder) {
  if (selectExprBuilder?.constructor === Function)
  if (selectExprBuilder?.constructor === Function && typeof selectExprBuilder === 'string') return selectExprBuilder;
}

function getClassNameOrType(value) {
  return value instanceof Object ? `class '${value.constructor.name}'`: `type '${typeof value}'`;
}

function getDerivedSelectExprListBuilder(selectExprListBuilder, requestedFields) {
  const derivedSelectExprListBuilder = {};
  for (const alias in requestedFields) {
    const field = requestedFields[alias];
    
    if (field === null || field?.constructor === Object) {

      const selectExprBuilder = selectExprListBuilder[alias];
      if (selectExprBuilder == null) derivedSelectExprListBuilder[alias] = null;
      else if (selectExprBuilder?.constructor === Function) derivedSelectExprListBuilder[alias] = selectExprBuilder;
      else if (typeof selectExprBuilder === 'string') derivedSelectExprListBuilder[alias] = alias === selectExprBuilder ? null : selectExprBuilder;
      else if (selectExprBuilder?.constructor === Object) {

        for (const _alias in selectExprBuilder) {
          let _selectExprBuilder = selectExprBuilder[_alias];
          if (_selectExprBuilder === null) _selectExprBuilder = selectExprListBuilder[_alias];
          if (_selectExprBuilder == null) derivedSelectExprListBuilder[_alias] = null;
          else if (_selectExprBuilder?.constructor === Function) derivedSelectExprListBuilder[_alias] = _selectExprBuilder;
          else if (typeof _selectExprBuilder === 'string') derivedSelectExprListBuilder[_alias] = _alias === _selectExprBuilder ? null : _selectExprBuilder;
        }

      }
    } else if (typeof field === 'string') derivedSelectExprListBuilder[alias] = field;
    else throw TypeError(`A value of ${getClassNameOrType(field)} is not valid for the requested field '${alias}', allowed: 'null', 'string' or 'Object'`);

  }
  return derivedSelectExprListBuilder;
}

export class SQLBuilder {

  constructor(selectExprListBuilder, whereConditionBuilder) {

    this.selectExprListBuilder = {};
    for (const alias in selectExprListBuilder) {
      const selectExprBuilder = selectExprListBuilder[alias];

      const allowedType = selectExprBuilder === null
      || selectExprBuilder?.constructor === Object
      || selectExprBuilder?.constructor === Function
      || typeof selectExprBuilder === 'string';
      if (!allowedType) throw TypeError(`A value of ${getClassNameOrType(selectExprBuilder)} is not valid for the property '${alias}' of the constructor argument 'selectExprListBuilder', allowed: 'null', 'string', 'Function' or 'Object'`);

      if (selectExprBuilder?.constructor === Object) {
        for (const _alias in selectExprBuilder) {
          const _selectExprBuilder = selectExprBuilder[_alias];

          const _allowedType = _selectExprBuilder === null
          || _selectExprBuilder?.constructor === Function
          || typeof _selectExprBuilder === 'string';
          if (!_allowedType) throw TypeError(`A value of ${getClassNameOrType(_selectExprBuilder)} is not valid for the nested property '${alias}.${_alias}' of the constructor argument 'selectExprListBuilder', allowed: 'null', 'string', or 'Function'`);
        }
      }

      this.selectExprListBuilder[alias] = selectExprBuilder;
    }

    this.whereConditionBuilder = whereConditionBuilder;

    // this.toSelectExpr = this.toSelectExpr.bind(this);
    // this.toWhereClause = this.toWhereClause.bind(this);
    // this.toAssignment = this.toAssignment.bind(this);

    this.buildSelectExprList = this.buildSelectExprList.bind(this);
    this.buildWhereCondition = this.buildWhereCondition.bind(this);
    this.buildAssignmentList = this.buildAssignmentList.bind(this);
  }

  // toSelectExpr(cols, [name, subfields], vars) {
  //   const column = this.fieldsMapping[name];
  //   return column !== undefined ? (
  //     typeof column === 'function'
  //     ? { ...cols, [name]: column(vars) } : (
  //       typeof column === 'object'
  //       ? { ...cols, ...column }
  //       : { ...cols, [name]: column }
  //     )
  //   ) : (
  //     Object.keys(subfields).length === 0
  //     ? { ...cols, [name]: name }
  //     : cols
  //   );
  // }

  // toWhereClause([name, value]) {
  //   const clause = this.searchMapping[name];
  //   return clause === undefined
  //     ? name + ' = ?'
  //     : typeof clause === 'function'
  //     ? (
  //       Array.isArray(value)
  //       && new Array(value.length).fill('?').join(', ')
  //       || '?'
  //       |> clause(#)
  //     )
  //     : clause;
  // }

  // toAssignment([name, value]) {
  //   const column = this.fieldsMapping[name];
  //   return (
  //     column === undefined
  //     ? name
  //     : column
  //   ) + ' = ' + (
  //     value instanceof Array
  //     ? value[0]
  //     : '?'
  //   );
  // }

  buildSelectExprList(requestedFields, params = {}) {
    const selectExprListBuilder = getDerivedSelectExprListBuilder(this.selectExprListBuilder, requestedFields);
    const aliases = Object.keys(selectExprListBuilder);

    let selectExprList = '';
    let separator = ', ';
    for (let index = 0; index < aliases.length; index++) {
      if (index === aliases.length - 1) separator = '';
      const alias = aliases[index];
      const selectExprBuilder = selectExprListBuilder[alias];

      if (selectExprBuilder === null) selectExprList += alias + separator;
      else {
        const selectExpr = selectExprBuilder?.constructor === Function ? selectExprBuilder(params) : selectExprBuilder;
        selectExprList += selectExpr + ' AS ' + alias + separator;
      }
    }

    return selectExprList;
  }

  buildWhereCondition(filter = {}, extra = []) {
    return Object.entries(filter)
    |> (#.length + extra.length) > 0 && [
      [ ...#.map(this.toClause), ...extra ] |> 'WHERE ' + #.join(' AND '),
      #.reduce(toParams, [])
    ] || [ '', [] ];
  }

  buildAssignmentList(input) {
    return Object.entries(input).filter(nonUndefined)
    |> #.length > 0 && [
      'SET ' + #.map(this.assignColumn).join(', '),
      #.map(toParam)
    ] || [ '', [] ];
  }
}

export function jsonArray(cols) {
  return `CONCAT('[', GROUP_CONCAT(${cols} SEPARATOR ', '), ']')`;
}


const selectExprListBuilder = {
  name: '_name',
  surname: null,
  email: 'email',
  friendsKeys() { return '(SELECT id FROM friends WHERE person_1 = id)'; },
  school: { schoolId: 'school_id', city: null },
  city({ cityId = 1 }) { return `(SELECT name FROM cities WHERE id = ${cityId})`; },
};

const sqlBuilder = new SQLBuilder(selectExprListBuilder);
const selectExprList = sqlBuilder.buildSelectExprList({ name: {}, surname: null, email: null, cityId: 'city_id', school: { name: null, pupleCount: {} }, city: null }, { cityId: 2 });
console.log(selectExprList);