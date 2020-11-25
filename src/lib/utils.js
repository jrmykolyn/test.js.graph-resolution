const keyOn = (property) => (data) => ({ [data[property]]: data });

module.exports = {
  keyOn,
};
