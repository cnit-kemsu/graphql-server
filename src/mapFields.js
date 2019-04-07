import graphqlFields from 'graphql-fields';

function toStringExpression([name, asName]) {
  return name + ' ' + asName;
}

export function mapFields(resolveInfo, mapper) {

  const mapField = (fields, [name, subfields]) => mapper[name] !== undefined ? (
    typeof mapper[name] === 'object'
    ? { ...fields, ...mapper[name] }
    : { ...fields, [name]: mapper[name] }
  ) : (
    Object.keys(subfields).length === 0
    ? { ...fields, [name]: name }
    : fields
  );

  return graphqlFields(resolveInfo)
  |> Object.entries(#).reduce(mapField, {})
  |> Object.entries(#).map(toStringExpression).join(', ');
}