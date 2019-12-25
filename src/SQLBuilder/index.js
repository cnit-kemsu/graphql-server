import { printTypeOrInstance } from './printTypeOrInstance';

function putInParentheses(predicate) {
  return '(' + predicate + ')';
}

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

export class SQLBuilder {

  constructor(selectExprListBuilder = {}, whereConditionBuilder = {}, assignmentListBuilder = {}) {

    // validates selectExprListBuilder
    this.selectExprListBuilder = {};
    for (const builderName in selectExprListBuilder) {
      const builder = selectExprListBuilder[builderName];

      // validates builder
      if (typeof builder !== 'string' && builder?.constructor !== Function && builder?.constructor !== AsyncFunction) {
        if (builder?.constructor !== Array)
          throw TypeError(`The select expression builder '${builderName}' must be of type 'string' or an instance of 'Array', 'Function' or 'AsyncFunction', but it is ${printTypeOrInstance(builder)}.`);
        
        // validates requested builders
        try {

          for (const index in builder) {

            const requestedBuilderName = builder[index];
            if (typeof requestedBuilderName !== 'string')
              throw TypeError(`The requested builder with index '${index}' must be of type 'string', but it is ${printTypeOrInstance(requestedBuilderName)}.`);

            const requestedBuilder = selectExprListBuilder[requestedBuilderName];
            if (requestedBuilder === undefined) throw TypeError(`The requested builder '${requestedBuilderName}' does not exist.`);
            if (requestedBuilder?.constructor === Array) throw TypeError(`The requested builder '${requestedBuilderName}' cannot be the builder that is an instance of 'Array'.`);
          }

        } catch (error) {
          throw TypeError(`Invalid select expression builder '${builderName}'. ${error.message}'`);
        }

      }

      this.selectExprListBuilder[builderName] = builder;
    }

    // validates whereConditionBuilder
    this.whereConditionBuilder = {};
    for (const builderName in whereConditionBuilder) {
      const builder = whereConditionBuilder[builderName];
      if (builder?.constructor !== Function && builder?.constructor !== AsyncFunction)
        throw TypeError(`The predicate builder '${builderName}' must be an instance of 'Function' or 'AsyncFunction', but it is ${printTypeOrInstance(builder)}.`);
      this.whereConditionBuilder[builderName] = builder;
    }

    // validates assignmentListBuilder
    this.assignmentListBuilder = {};
    for (const builderName in assignmentListBuilder) {
      const builder = assignmentListBuilder[builderName];
      if (builder?.constructor
        |> # !== Function && # !== AsyncFunction
      ) throw TypeError(`The assignment builder '${builderName}' must be an instance of 'Function' or 'AsyncFunction', but it is ${printTypeOrInstance(builder)}.`);
      this.assignmentListBuilder[builderName] = builder;
    }

    this.buildSelectExprList = this.buildSelectExprList.bind(this);
    this.buildWhereClause = this.buildWhereClause.bind(this);
    this.buildAssignmentList = this.buildAssignmentList.bind(this);
  }

  /**
   * @param {object} requestedFields
   * @param {any=} requestedFields.
   * @param {string[]} [extraPredicates]
   * @returns {string}
   */
  async buildSelectExprList(requestedFields, params) {

    if (requestedFields == null) return '*';
    // validates arguments
    if (requestedFields.constructor !== Object)
      throw TypeError(`The first argument to the select expression list builder must be an instance of 'Object', but it is ${printTypeOrInstance(requestedFields)}.`);

    const _requestedFields = {};
    for (const fieldName in requestedFields) {
      const field = requestedFields[fieldName];

      if (field !== null && typeof field !== 'string' && field?.constructor !== Object)
        throw TypeError(`The requested field '${fieldName}' must be value of 'null' or an instance of 'Object', but it is ${printTypeOrInstance(field)}.`);
      
      const builder = this.selectExprListBuilder[fieldName];
      if (builder == null) throw TypeError(`A select expression builder '${fieldName}' does not exist.`);

      if (builder?.constructor !== Array) _requestedFields[fieldName] = null;
      else for (const requestedBuilderName of builder) _requestedFields[requestedBuilderName] = null;
    }

    const selectExprList = [];
    for (const fieldName in _requestedFields) {

      const builder = this.selectExprListBuilder[fieldName];

      try {

        const selectExpr = builder instanceof Function ? await builder(params) : builder;
        if (typeof selectExpr !== 'string')
          throw TypeError(`The returned result must be of type 'string', but it is ${printTypeOrInstance(selectExpr)}.`);
        (fieldName === selectExpr ? fieldName : `${selectExpr} AS ${fieldName}`)
        |> selectExprList.push(#);

      } catch(error) {
        throw error.constructor(`An error occurred in the select expression builder '${fieldName}'. ${error.message}`);
      }
      
    }

    return selectExprList.join(', ');
  }

  /**
   * @param {object} filters
   * @param {any=} filters.
   * @param {string[]} [extraPredicates]
   * @returns {string}
   */
  async buildWhereClause(filters, extraPredicates, params) {

    if (filters == null) return '';
    // validates arguments
    if (filters.constructor !== Object)
      throw TypeError(`The first argument to the where clause builder must be an instance of 'Object', but it is ${printTypeOrInstance(filters)}.`);
    if (extraPredicates != null) {
      if (extraPredicates.constructor !== Array)
        throw TypeError(`The second argument to the where clause builder must be an instance of 'Array', but it is ${printTypeOrInstance(extraPredicates)}.`);
      for (const index in extraPredicates) {
        const predicate = extraPredicates[index];
        if (predicate !== null && typeof predicate !== 'string')
          throw TypeError(`An extra predicate with index '${index}' must be of type 'string', but it is ${printTypeOrInstance(predicate)}.`);
      }
    }

    const predicateList = [];
    for (const filterName in filters) {

      const builder = this.whereConditionBuilder[filterName];
      if (builder == null) throw TypeError(`A predicate builder '${filterName}' does not exist.`);

      const filterValue = filters[filterName];
      // if the value of the current argument is not defined, then processing is skipped
      if (filterValue === undefined) continue;

      try {

        const predicate = await builder(filterValue, params);
        if (!predicate) continue;
        
        if (typeof predicate !== 'string')
          throw TypeError(`The returned result must be of type 'string', but it is ${printTypeOrInstance(predicate)}.`);
        predicateList.push(predicate);

      } catch(error) {
        throw error.constructor(`An error occurred in the predicate builder '${filterName}'. ${error.message}`);
      }
      
    }

    if (extraPredicates != null) for (const predicate of extraPredicates) predicateList.push(predicate);

    return predicateList.length === 0
      ? ''
      : 'WHERE ' + predicateList.map(putInParentheses).join(' AND ');
  }

  /**
   * @param {object} inputArgs
   * @param {any=} inputArgs.
   * @param {any} [context]
   * @returns {string}
   */
  async buildAssignmentList(inputArgs, context) {

    if (inputArgs == null) return '';
    // validates arguments
    if (inputArgs.constructor !== Object) throw TypeError(`The first argument to the assignment builder must be an instance of 'Object', but it is ${printTypeOrInstance(inputArgs)}.`);

    const assignmentList = [];
    for (const inputName in inputArgs) {

      const builder = this.assignmentListBuilder[inputName];
      if (builder == null) throw TypeError(`An assignment builder '${inputName}' does not exist.`);

      const inputValue = inputArgs[inputName];
      // if the value of the current argument is not defined, then processing is skipped
      if (inputValue === undefined) continue;

      try {

        const assignment = await builder(inputValue, context);
        if (typeof assignment !== 'string') throw TypeError(`The returned result must be of type 'string', but it is ${printTypeOrInstance(assignment)}.`);
        assignmentList.push(assignment);

      } catch(error) {
        throw error.constructor(`An error occurred in the assignment builder '${inputName}'. ${error.message}`);
      }
      
    }

    return assignmentList.join(', ');
  }
}