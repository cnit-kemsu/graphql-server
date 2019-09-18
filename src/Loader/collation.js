export const collation = {
  find(keyProp) {
    return function (data, keys) {
      return keys.map(
        key => data.find(
          row => row[keyProp] === key
        )
      );
    };
  },
  filter(keyProp) {
    return function (data, keys) {
      return keys.map(
        key => data.filter(
          row => row[keyProp] === key
        )
      );
    };
  }
};