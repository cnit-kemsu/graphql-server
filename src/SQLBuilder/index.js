function getTypeOrInstance(value) {
  if (value === null) return null;
  return value instanceof Object ? value.constructor : typeof value;
}

function printTypeOrInstance(value) {
  return value instanceof Object ? `instance of '${value.constructor.name}'`: `type '${typeof value}'`;
}

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

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
    else throw TypeError(`A value of ${printTypeOrInstance(field)} is not valid for the requested field '${alias}', allowed: 'null', 'string' or 'Object'`);

  }
  return derivedSelectExprListBuilder;
}

export class SQLBuilder {

  constructor(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder) {

    // validates selectExprListBuilder
    this.selectExprListBuilder = {};
    for (const alias in selectExprListBuilder) {
      const selectExprBuilder = selectExprListBuilder[alias];

      const allowedType = selectExprBuilder === null
      || selectExprBuilder?.constructor === Object
      || selectExprBuilder?.constructor === Function
      || typeof selectExprBuilder === 'string';
      if (!allowedType) throw TypeError(`A value of ${printTypeOrInstance(selectExprBuilder)} is not valid for the property '${alias}' of the constructor argument 'selectExprListBuilder', allowed: 'null', 'string', 'Function' or 'Object'`);

      if (selectExprBuilder?.constructor === Object) {
        for (const _alias in selectExprBuilder) {
          const _selectExprBuilder = selectExprBuilder[_alias];

          const _allowedType = _selectExprBuilder === null
          || _selectExprBuilder?.constructor === Function
          || typeof _selectExprBuilder === 'string';
          if (!_allowedType) throw TypeError(`A value of ${printTypeOrInstance(_selectExprBuilder)} is not valid for the nested property '${alias}.${_alias}' of the constructor argument 'selectExprListBuilder', allowed: 'null', 'string', or 'Function'`);
        }
      }

      this.selectExprListBuilder[alias] = selectExprBuilder;
    }

    // validates whereConditionBuilder
    this.whereConditionBuilder = {};
    for (const predicate in whereConditionBuilder) {
      const builder = whereConditionBuilder[predicate];
      const builderType = getTypeOrInstance(builder);
      if ( builderType === Function
        || builderType === 'string'
      ) throw TypeError(`The predicate builder must be of type 'string' or an instance of 'Function', but got ${printTypeOrInstance(builder)}.`);
      this.whereConditionBuilder[predicate] = builder;
    }

    // validates assignmentListBuilder
    this.assignmentListBuilder = {};
    for (const assignment in assignmentListBuilder) {
      const builder = assignmentListBuilder[assignment];
      const builderType = getTypeOrInstance(builder);
      if (builderType === Function
        || builderType === AsyncFunction
        || builderType === 'string'
      ) throw TypeError(`The assignment builder must be of type 'string' or one of the following instances: 'Function' or 'AsyncFunction', but got ${printTypeOrInstance(builder)}.`);
      this.assignmentListBuilder[assignment] = builder;
    }

    this.buildSelectExprList = this.buildSelectExprList.bind(this);
    this.buildWhereClause = this.buildWhereClause.bind(this);
    this.buildAssignmentList = this.buildAssignmentList.bind(this);
  }

  buildSelectExprList(requestedFields, params = {}) {
    const selectExprListBuilder = getDerivedSelectExprListBuilder(this.selectExprListBuilder, requestedFields);
    const aliases = Object.keys(selectExprListBuilder);

    let selectExprList = '';
    const _params = [];
    let separator = ', ';
    for (let index = 0; index < aliases.length; index++) {
      if (index === aliases.length - 1) separator = '';
      const alias = aliases[index];
      const selectExprBuilder = selectExprListBuilder[alias];

      if (selectExprBuilder === null) selectExprList += alias + separator;
      else {
        let selectExpr;

        if (selectExprBuilder?.constructor === Function) {
          const _selectExpr = selectExprBuilder(params);
          if (_selectExpr instanceof Array) {
            selectExpr = _selectExpr[0];
            if (typeof selectExpr !== 'string') throw TypeError(`A value of ${printTypeOrInstance(selectExpr)} is not valid for the first returned element of '${alias}', allowed only 'string'`);
            _params.push(..._selectExpr.slice(1));
          } else if (typeof _selectExpr === 'string') selectExpr = _selectExpr;
          else throw TypeError(`A value of ${printTypeOrInstance(_selectExpr)} is not valid for the return value of '${alias}', allowed: 'string' or 'Array'`);
        } else selectExpr = selectExprBuilder;

        selectExprList += selectExpr + ' AS ' + alias + separator;
      }
    }

    return [selectExprList, _params];
  }

  /**
   * @param {object} filters
   * @param {string | number | boolean | (string | number | boolean)[]=} filters.
   * @param {string[]} [extraPredicates]
   * @returns {string}
   */
  buildWhereClause(filters, extraPredicates) {

    if (filters == null) return '';
    // validates input arguments
    if (filters.constructor !== Object)
      throw TypeError(`The first input argument to the method 'buildWhereClause' must be an instance of 'Object', but got ${printTypeOrInstance(filters)}.`);
    if (extraPredicates?.constructor !== Array)
      throw TypeError(`The second input argument to the method 'buildWhereClause' must be an instance of 'Array', but got ${printTypeOrInstance(extraPredicates)}.`);

    const predicates = [], params = [];
    for (const filterName in filters) {
      
      const filterValue = filters[filterName];
      // if the value of the current filter is not defined, then processing is skipped
      if (filterValue === undefined) continue;

      let builder = this.whereConditionBuilder[filterName];
      // if the builder does not exist, then it is created dynamically
      if (builder == null) builder = filterName;
      
      const builderType = getTypeOrInstance(builder);
      try {

        const isMultipleParameterized = filterValue instanceof Array;
        if (!isMultipleParameterized && filterValue instanceof Object)
          throw TypeError(`The filter must be an instance of 'Array' or one of the following types: 'null', 'boolean', 'number', 'string', but got ${printTypeOrInstance(filterValue)}.`);
        if (isMultipleParameterized) for (const index in filterValue) {
          const elementType = getTypeOrInstance(filterValue[index]);
          if (elementType !== null
            || elementType !== 'string'
            || elementType !== 'number'
            || elementType !== 'boolean'
          ) throw TypeError(`Each filter element must be one of the following types: 'null', 'boolean', 'number', 'string', but got ${printTypeOrInstance(elementType)}.`);
        }

        const substitution = isMultipleParameterized ? new Array(filterValue.length).fill('?').join(', ') : '?';

        if (builderType === Function) {
          builder(substitution)
          |> predicates.push;
        } else {
          isMultipleParameterized ? ` IN (${substitution})` : ` = ${substitution}`
          |> predicates.push(filterName + #);
        }

        if (isMultipleParameterized) params.push(...filterValue);
        else params.push(filterValue);

      } catch(error) {
        throw new TypeError(`An error occurred while trying to build a predicate for a filter named ${filterName}. ${error.message}`);
      }

    }

    if (extraPredicates != null) for (const predicate of extraPredicates) {
      if (typeof predicate !== 'string') throw TypeError(`Each extra predicate must be of type 'string', but one is ${printTypeOrInstance(predicate)}.`);
      predicates.push(predicate);
    }

    return [predicates.length === 0 ? '' : 'WHERE ' + predicates.map(putInParentheses).join(' AND '), params];
  }

  /**
   * 
   * @param {object} inputArgs
   * @param {string | number | boolean | {} | any[]=} inputArgs.
   * @param {any} [context]
   * @returns {string}
   */
  async buildAssignmentList(inputArgs, context) {

    if (inputArgs == null) return '';
    // validates input arguments
    if (inputArgs.constructor !== Object)
      throw TypeError(`The first input argument to the method 'buildAssignmentList' must be an instance of 'Object', but got ${printTypeOrInstance(inputArgs)}.`);

    const assignmentList = [], params = [];
    for (const inputName in inputArgs) {

      const inputValue = inputArgs[inputName];
      // if the value of the current argument is not defined, then processing is skipped
      if (inputValue === undefined) continue;
      
      // gets the assignment builder with the current argument name
      let builder = this.assignmentListBuilder[inputName];
      // if the builder does not exist, then it is created dynamically
      if (builder == null) builder = inputName;

      const builderType = getTypeOrInstance(builder);
      try {

        // if the type of the current builder is a function, then it is expected to return an assignment and, optionally, its parameters
        if (builderType === Function || builderType === AsyncFunction) {

          const assignment = await builder(inputValue, context);
          //if (assignment == null) continue; else //TODO: check if step is necessary
          if (assignment instanceof Array) {
            if (typeof assignment[0] !== 'string')
              throw TypeError(`The first element of the array that is returned by the builder function must be of type 'string', but got ${printTypeOrInstance(assignment[0])}.`);
            assignmentList.push(assignment[0]);
            assignment.slice(1).map(convertParam)
            |> params.push(...#);
          }
          else if (typeof assignment === 'string') assignmentList.push(assignment);
          else throw TypeError(`The builder function is expected to return an instance of 'Array' or a value of type 'string', but got ${printTypeOrInstance(assignment)}.`);

        }
        // if the type of the current builder is a string, then it is used as the column name
        // if the current builder was not created dynamically, then the argument name is an alias for the column name
        else {
          assignmentList.push(`${builder} = ?`);
          convertParam(inputValue)
          |> params.push;
        }

      } catch(error) {
        throw new TypeError(`An error occurred while trying to build an assignment for an argument named ${inputName}. ${error.message}`);
      }
      
    }

    return [assignmentList.join(', '), params];
  }
}

function putInParentheses(predicate) {
  return '(' + predicate + ')';
}

function convertParam(param) {
  if (param === null) return null;
  if (param instanceof Object) {
    if (param.constructor === Object || param.constructor === Array) return JSON.stringify(param);
    //if (param.constructor === Date) return param; //TODO: check if step is necessary
    throw new TypeError(`The parameter must be one of the following types: 'null', 'boolean', 'number', 'string'; or instances: 'Object' or 'Array', but got ${printTypeOrInstance(param)}.`);
  }
  return param;
}

export function jsonArray(cols) {
  return `CONCAT('[', GROUP_CONCAT(${cols} SEPARATOR ', '), ']')`;
}

// const selectExprListBuilder = {
//   name: '_name',
//   surname: null,
//   email: 'email',
//   friendsKeys() { return '(SELECT id FROM friends WHERE person_1 = id)'; },
//   school: { schoolId: 'school_id', city: null },
//   city({ cityId = 1 }) { return [`(SELECT name FROM cities WHERE id = ?)`, cityId]; },
// };

// const whereConditionBuilder = {
//   name: '_name',
//   surname: null,
//   cityId({ cityId = 1 }) { return [`city_id != ?`, cityId]; },
// };

// const assignmentListBuilder = {
//   name: '_name',
//   surname: null,
//   async schoolId({ schoolId }) { return ['school_id = ?, city_id = (SELECT city_id FROM schools WHERE school_id = ?)', schoolId, schoolId]; }
// };

// const sqlBuilder = new SQLBuilder(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder);
// const selectExprList = sqlBuilder.buildSelectExprList({ name: {}, surname: null, email: null, cityId: 'city_id', school: { name: null, pupleCount: {} }, city: null }, { cityId: 2 });
// const whereClause = sqlBuilder.buildWhereClause({ name: 'lalala', surname: ['eee', 'uuu'], email: 'qwerty', cityId: 2 });
// console.log(selectExprList);
// console.log(whereClause);
// (async function lalala () {
//   const assignmentList = await sqlBuilder.buildAssignmentList({ name: 'lalala', surname: 'tututu', email: 'asdfgh', schoolId: 3 });
//   console.log(assignmentList);
// })()