function printTypeOrInstance(value) {
  if (value === undefined) return `'undefined'`;
  if (value === null) return `'null'`;
  return value instanceof Object ? `instance of '${value.constructor.name}'`: `type '${typeof value}'`;
}

function putInParentheses(predicate) {
  return '(' + predicate + ')';
}

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

export class SQLBuilder {

  constructor(selectExprListBuilder, whereConditionBuilder, assignmentListBuilder) {

    // validates selectExprListBuilder
    this.selectExprListBuilder = {};
    for (const builderName in selectExprListBuilder) {
      const builder = selectExprListBuilder[builderName];
      if (typeof builder !== 'string' && builder?.constructor !== Function) {
        if (builder?.constructor !== Array) throw TypeError(`The select expression builder named '${builderName}' must be of type 'string' or an instance of 'Array' or 'Function', but got ${printTypeOrInstance(builder)}.`);
        for (const index in builder) {
          const requestedField = builder[index];
          if (typeof requestedField !== 'string') throw TypeError(`The requested field with index '${index}' of the select expression builder named '${builderName}' must be of type 'string', but got ${printTypeOrInstance(requestedField)}.`);
          const _builder = selectExprListBuilder[builderName];
          if (_builder === undefined) throw TypeError(`A builder named '${requestedField}' specified in the requested field with index '${index}' of the select expression builder named '${builderName}' does not exist.`);
          if (_builder?.constructor === Array) throw TypeError(`The requested field with index '${index}' of the select expression builder named '${builderName}' cannot be the builder that is an instance of 'Array'.`);
        }
      }
      this.selectExprListBuilder[builderName] = builder;
    }

    // validates whereConditionBuilder
    this.whereConditionBuilder = {};
    for (const builderName in whereConditionBuilder) {
      const builder = whereConditionBuilder[builderName];
      if (builder?.constructor !== Function) throw TypeError(`The predicate builder named '${builderName}' must be an instance of 'Function', but got ${printTypeOrInstance(builder)}.`);
      this.whereConditionBuilder[builderName] = builder;
    }

    // validates assignmentListBuilder
    this.assignmentListBuilder = {};
    for (const builderName in assignmentListBuilder) {
      const builder = assignmentListBuilder[builderName];
      if (builder?.constructor
        |> # !== Function || # !== AsyncFunction
      ) throw TypeError(`The assignment builder named '${builderName}' must be an instance of 'Function' or 'AsyncFunction', but got ${printTypeOrInstance(builder)}.`);
      this.assignmentListBuilder[builderName] = builder;
    }

    this.buildSelectExprList = this.buildSelectExprList.bind(this);
    this.buildWhereClause = this.buildWhereClause.bind(this);
    this.buildAssignmentList = this.buildAssignmentList.bind(this);
  }

  buildSelectExprList(requestedFields, params) {

    const _requestedFields = {};
    for (const fieldName in requestedFields) {
      const field = requestedFields[fieldName];
      if (typeof field !== 'string' && field?.constructor !== Object) throw TypeError(`The requested field named '${fieldName}' must be value of 'null' or an instance of 'Object', but got ${printTypeOrInstance(field)}.`);
      const builder = this.selectExprListBuilder[fieldName];
      if (builder == null) throw TypeError(`An select expression builder named '${fieldName}' does not exist.`);
      if (builder?.constructor !== Array) _requestedFields[fieldName] = null;
      else for (const _fieldName of builder) _requestedFields[_fieldName] = null;
    }

    const selectExprList = [];
    for (const fieldName in _requestedFields) {

      const builder = this.selectExprListBuilder[fieldName];

      try {

        const selectExpr = (builder instanceof Array ?  builder(params) : builder) + ' AS ' + fieldName;
        selectExprList.push(selectExpr);

      } catch(error) {
        throw new TypeError(`An error occurred while trying to build a select expression for a field named ${fieldName}. ${error.message}`);
      }
      
    }

    return selectExprList.join(', ');
  }

  /**
   * @param {object} filters
   * @param {any} filters.
   * @param {string[]} [extraPredicates]
   * @returns {string}
   */
  buildWhereClause(filters, extraPredicates) {

    if (filters == null) return '';
    // validates arguments
    if (filters.constructor !== Object) throw TypeError(`The first argument to the method 'buildWhereClause' must be an instance of 'Object', but got ${printTypeOrInstance(filters)}.`);
    if (extraPredicates != null) {
      if (extraPredicates.constructor !== Array) throw TypeError(`The second argument to the method 'buildWhereClause' must be an instance of 'Array', but got ${printTypeOrInstance(extraPredicates)}.`);
      for (const index in extraPredicates) {
        const predicate = extraPredicates[index];
        if (typeof predicate !== 'string') throw TypeError(`An extra predicate with index '${index}' must be of type 'string', but got ${printTypeOrInstance(predicate)}.`);
      }
    }

    const predicateList = [];
    for (const filterName in filters) {

      const builder = this.whereConditionBuilder[filterName];
      if (builder == null) throw TypeError(`A predicate builder named '${filterName}' does not exist.`);

      const filterValue = filters[filterName];
      // if the value of the current argument is not defined, then processing is skipped
      if (filterValue === undefined) continue;

      try {

        const predicate = builder(filterValue);
        if (typeof predicate !== 'string') throw TypeError(`The result returned by the predicate builder must be of type 'string', but got ${printTypeOrInstance(predicate)}.`);
        predicateList.push(predicate);

      } catch(error) {
        throw new TypeError(`An error occurred while trying to build a predicate for a filter named ${filterName}. ${error.message}`);
      }
      
    }

    if (extraPredicates != null) for (const predicate of extraPredicates) predicateList.push(predicate);

    return predicateList.length === 0
      ? ''
      : 'WHERE ' + predicateList.map(putInParentheses).join(' AND ');
  }

  /**
   * 
   * @param {object} inputArgs
   * @param {any} inputArgs.
   * @param {any} [context]
   * @returns {string}
   */
  async buildAssignmentList(inputArgs, context) {

    if (inputArgs == null) return '';
    // validates arguments
    if (inputArgs.constructor !== Object) throw TypeError(`The first argument to the method 'buildAssignmentList' must be an instance of 'Object', but got ${printTypeOrInstance(inputArgs)}.`);

    const assignmentList = [];
    for (const inputName in inputArgs) {

      const builder = this.assignmentListBuilder[inputName];
      if (builder == null) throw TypeError(`An assignment builder named '${inputName}' does not exist.`);

      const inputValue = inputArgs[inputName];
      // if the value of the current argument is not defined, then processing is skipped
      if (inputValue === undefined) continue;

      try {

        const assignment = await builder(inputValue, context);
        if (typeof assignment !== 'string') throw TypeError(`The result returned by the assignment builder must be of type 'string', but got ${printTypeOrInstance(assignment)}.`);
        assignmentList.push(assignment);

      } catch(error) {
        throw new TypeError(`An error occurred while trying to build an assignment for an input argument named ${inputName}. ${error.message}`);
      }
      
    }

    return assignmentList.join(', ');
  }
}