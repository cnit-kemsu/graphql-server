export function mapFilter(filter = {}, mapper = {}) {

  const mapValue = ({ where, params }, [name, value]) =>
  mapper[name] !== undefined ? {
    where: [
      ...where,
      typeof mapper[name] === 'function'
      ? mapper[name](':' + name)
      : mapper[name]
    ],
    params: { ...params, [name]: value }
  } : {
    where: [ ...where, name + ' = :' + name ],
    params: { ...params, [name]: value }
  };

  return Object.entries(filter).reduce(mapValue, { where: [] })
  |> #.where.length > 0 && [
    'WHERE ' + #.where.join(' AND '),
    #.params
  ] || ['', {}];
  // const aaa = Object.entries(filter).reduce(mapValue, { where: [] })
  // const bbb = aaa.where.length > 0 && [
  //   'WHERE ' + aaa.where.join(' AND '),
  //   aaa.params
  // ] || ['', {}];
  // const ccc = 5;
  // return bbb;
}