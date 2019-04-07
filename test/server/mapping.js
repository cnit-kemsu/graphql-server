// const buildingFieldsMapping = {
//   id: 'id',
//   name: 'name',
//   address: 'address',
//   roomRange: 'room_range',
//   extraRooms: 'extra_rooms',
//   operations: { id: 'id' },
//   rooms: { roomRange: 'room_range' },
//   accommodations: { id: 'id' },
//   allRooms: { id: 'id', roomRange: 'room_range', extraRooms: 'extra_rooms' }
// };

// const buildingFilterMapping = {
//   keys: filters.valueInArray('id'),
//   //name: filters.valueLike(['name'], 1),
//   name: (value, param, prefix) => ({
//     mappedFilter: `name LIKE ${prefix+param}`,
//     params: { [param]: `%${value}%` }
//   })
// };