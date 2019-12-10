function getClassNameOrType(value) {
  return value instanceof Object ? `class '${value.constructor.name}'`: `type '${typeof value}'`;
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
    else throw TypeError(`A value of ${getClassNameOrType(field)} is not valid for the requested field '${alias}', allowed: 'null', 'string' or 'Object'`);

  }
  return derivedSelectExprListBuilder;
}

export class SQLBuilder {

  constructor(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder) {

    //validate selectExprListBuilder
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

    //validate whereConditionBuilder
    this.whereConditionBuilder = {};
    for (const predicate in whereConditionBuilder) {
      const predicateBuilder = whereConditionBuilder[predicate];
      const allowedType = predicateBuilder === null
      || predicateBuilder?.constructor === Function
      || typeof predicateBuilder === 'string';
      if (!allowedType) throw TypeError(`A value of ${getClassNameOrType(predicateBuilder)} is not valid for the property '${predicate}' of the constructor argument 'whereConditionBuilder', allowed: 'null', 'string', or 'Function'`);
      this.whereConditionBuilder[predicate] = predicateBuilder;
    }

    //validate assignmentListBuilder
    this.assignmentListBuilder = {};
    for (const assignment in assignmentListBuilder) {
      const assignmentBuilder = assignmentListBuilder[assignment];
      const allowedType = assignmentBuilder === null
      || assignmentBuilder?.constructor === Function
      || assignmentBuilder?.constructor === AsyncFunction
      || typeof assignmentBuilder === 'string';
      if (!allowedType) throw TypeError(`A value of ${getClassNameOrType(assignmentBuilder)} is not valid for the property '${assignment}' of the constructor argument 'assignmentListBuilder', allowed: 'null', 'string', or 'Function'`);
      this.assignmentListBuilder[assignment] = assignmentBuilder;
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
            if (typeof selectExpr !== 'string') throw TypeError(`A value of ${getClassNameOrType(selectExpr)} is not valid for the first returned element of '${alias}', allowed only 'string'`);
            _params.push(..._selectExpr.slice(1));
          } else if (typeof _selectExpr === 'string') selectExpr = _selectExpr;
          else throw TypeError(`A value of ${getClassNameOrType(_selectExpr)} is not valid for the return value of '${alias}', allowed: 'string' or 'Array'`);
        } else selectExpr = selectExprBuilder;

        selectExprList += selectExpr + ' AS ' + alias + separator;
      }
    }

    return [selectExprList, _params];
  }

  buildWhereClause(filter = {}, extraPredicates = []) {

    let whereCondition = '';
    const _params = [];
    let separator = '';
    for (const predicateName in filter) {
      
      const predicateBuilder = this.whereConditionBuilder[predicateName];
      const predicateValue = filter[predicateName];
      if (predicateValue === undefined) continue;
      
      if (predicateBuilder == null) {
        const allowedType = predicateValue === null
        || predicateValue?.constructor === Array
        || typeof predicateValue === 'string'
        || typeof predicateValue === 'number'
        || typeof predicateValue === 'boolean';
        if (!allowedType) throw TypeError(`A value of ${getClassNameOrType(predicateValue)} is not valid for the property '${predicateName}' of the 'buildWhereClause' function argument 'filter', allowed: 'null', 'boolean', 'number', 'string', or 'Array'`);
      }

      const isArray = predicateValue instanceof Array;
      const expr = isArray ? new Array(predicateValue.length).fill('?').join(', ') : '?';
      if (isArray) _params.push(...predicateValue);
      else _params.push(predicateValue);

      let predicate;
      if (predicateBuilder == null) predicate = predicateName + (isArray ? ` IN (${expr})` : ` = ${expr}`);
      else if (predicateBuilder?.constructor === Function) predicate = predicateBuilder(expr);
      else if (typeof predicateBuilder === 'string') predicate = predicateBuilder;// + (isArray ? ` IN (${expr})` : ` = ${expr}`);
      
      whereCondition += separator + predicate;

      if (!separator) separator = ' AND ';
    }

    for (const predicate of extraPredicates) {
      if (typeof predicate === 'string') whereCondition += separator + predicate;
      else throw TypeError(`A value of ${getClassNameOrType(predicate)} is not valid for the element of the 'buildWhereClause' function argument 'extraPredicates', allowed only 'string'`);
      if (!separator) separator = ' AND ';
    }

    return [whereCondition === '' ? '' : 'WHERE ' + whereCondition, _params];
  }

  // async buildAssignmentList(inputArgs, context) {

  //   let assignmentList = '';
  //   const _params = [];
  //   let separator = '';
  //   for (const inputName in inputArgs) {
      
  //     let assignmentBuilder = this.assignmentListBuilder[inputName];
  //     if (assignmentBuilder == null) assignmentBuilder = inputName;
  //     const inputValue = inputArgs[inputName];
  //     if (inputValue === undefined) continue;
      
  //     if (assignmentBuilder?.constructor !== Function && assignmentBuilder?.constructor !== AsyncFunction) {
  //       const allowedType = inputValue === null
  //       || typeof inputValue === 'string'
  //       || typeof inputValue === 'number'
  //       || typeof inputValue === 'boolean';
  //       if (!allowedType) throw TypeError(`A value of ${getClassNameOrType(inputValue)} is not valid for the property '${inputName}' of the argument 'inputArgs' of the function 'buildAssignmentList' , еру ащддщцштп allowed: 'null', 'boolean', 'number', or 'string'`);
  //     }

  //     let assignment;
  //     if (assignmentBuilder?.constructor === Function || assignmentBuilder?.constructor === AsyncFunction) {

  //       const _assignment = await assignmentBuilder(inputValue, context);
  //       if (_assignment instanceof Array) {
  //         assignment = _assignment[0];
  //         if (typeof assignment !== 'string') throw TypeError(`A value of ${getClassNameOrType(assignment)} is not valid for the first returned element of '${inputName}', allowed only 'string'`);
  //         _params.push(..._assignment.slice(1));
  //       } else if (typeof _assignment === 'string') assignment = _assignment;
  //       else if (_assignment == null) continue;
  //       else throw TypeError(`A value of ${getClassNameOrType(_assignment)} is not valid for the return value of '${inputName}', allowed: 'string' or 'Array'`);
  //     } else {
  //       assignment = `${assignmentBuilder} = ?`;
  //       _params.push(inputValue);
  //     }
      
  //     assignmentList += separator + assignment;

  //     if (!separator) separator = ', ';
  //   }

  //   return [assignmentList, _params];
  // }
  async buildAssignmentList(inputArgs, context) {

    const assignmentList = [], params = [];
    for (const inputName in inputArgs) {

      const inputValue = inputArgs[inputName];
      // if the value of the current argument is not defined, then processing is skipped
      if (inputValue === undefined) continue;
      
      // gets the assignment builder for the current argument name
      let builder = this.assignmentListBuilder[inputName];
      // if the current assignment builder does not exist, then it is created dynamically
      if (builder == null) builder = inputName;

      const builderType = builder?.constructor || typeof builder;
      //if the type of the current builder is not a function or asynchronous function,
      //then validates  
      // if (builderType !== Function && builderType !== AsyncFunction) {
      //   const allowedType = inputValue === null
      //   || typeof inputValue === 'string'
      //   || typeof inputValue === 'number'
      //   || typeof inputValue === 'boolean';
      //   if (!allowedType) throw TypeError(`A value of ${getClassNameOrType(inputValue)} is not valid for the property '${inputName}' of the argument 'inputArgs' of the function 'buildAssignmentList' , еру ащддщцштп allowed: 'null', 'boolean', 'number', or 'string'`);
      // }

      try {

        let assignment;
        if (builderType === Function || builderType === AsyncFunction) {

          const _assignment = await builder(inputValue, context);
          if (_assignment instanceof Array) {
            assignment = _assignment[0];
            if (typeof assignment !== 'string') throw TypeError(`A value of ${getClassNameOrType(assignment)} is not valid for the first element returned by the assignment builder '${inputName}', allowed only 'string'`);
            params.push(..._assignment.slice(1));
          } else if (typeof _assignment === 'string') assignment = _assignment;
          else if (_assignment == null) continue;
          else throw TypeError(`A value of ${getClassNameOrType(_assignment)} is not valid for the return value of '${inputName}', allowed: 'string' or 'Array'`);

        } else if (builderType === 'string') {
          // creates an expression to assign a column with the name of the current builder
          assignmentList.push(`${builderType} = ?`);
          convertParam(inputValue) |>
          params.push(#);
        }

      } catch(error) {
        throw new TypeError(`An error has occurred while trying to build assignment for argument name ${inputName} of type ${builderType}. ${error.message}`);
      }
      
    }

    return [assignmentList.join(', '), params];
  }
}

function convertParam(param) {
  if (param === null) return null;
  if (param instanceof Object) {
    if (param.constructor === Object || param.constructor === Array) return JSON.stringify(param);
    //if (param.constructor === Date) return param;
    throw new TypeError(`Invalid param type: ${param.constructor}`);
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