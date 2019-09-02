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

export class Mapping {

  constructor(fieldsMapping, searchMapping) {
    this.fieldsMapping = fieldsMapping;
    this.searchMapping = searchMapping;

    this.toColumn = this.toColumn.bind(this);
    this.toClause = this.toClause.bind(this);
    this.assignColumn = this.assignColumn.bind(this);

    this.toColumns = this.toColumns.bind(this);
    this.toFilter = this.toFilter.bind(this);
    this.toAssignment = this.toAssignment.bind(this);
  }

  toColumn(cols, [name, subfields], vars) {
    const column = this.fieldsMapping[name];
    return column !== undefined ? (
      typeof column === 'function'
      ? { ...cols, [name]: column(vars) } : (
        typeof column === 'object'
        ? { ...cols, ...column }
        : { ...cols, [name]: column }
      )
    ) : (
      Object.keys(subfields).length === 0
      ? { ...cols, [name]: name }
      : cols
    );
  }

  toClause([name, value]) {
    const clause = this.searchMapping[name];
    return clause === undefined
      ? name + ' = ?'
      : typeof clause === 'function'
      ? (
        Array.isArray(value)
        && new Array(value.length).fill('?').join(', ')
        || '?'
        |> clause(#)
      )
      : clause;
  }

  assignColumn([name, value]) {
    const column = this.fieldsMapping[name];
    return (
      column === undefined
      ? name
      : column
    ) + ' = ' + (
      value instanceof Array
      ? value[0]
      : '?'
    );
  }

  toColumns(resolveInfo, extra = {}, vars) {
    const _toColumn = (p1, p2) => this.toColumn(p1, p2, vars);
    return graphqlFields(resolveInfo)
    |> { ...#, ...extra }
    |> Object.entries(#).reduce(_toColumn, {})
    |> Object.entries(#).map(colAsField).join(', ');
  }

  toFilter(filter = {}, extra = []) {
    return Object.entries(filter)
    |> (#.length + extra.length) > 0 && [
      [ ...#.map(this.toClause), ...extra ] |> 'WHERE ' + #.join(' AND '),
      #.reduce(toParams, [])
    ] || [ '', [] ];
  }

  toAssignment(input) {
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