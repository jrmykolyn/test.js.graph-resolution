const keyOn = (property) => (data) => ({ [data[property]]: data });

const merge = (a, b) => ({ ...a, ...b });

module.exports = {
  keyOn,
  merge,
};
