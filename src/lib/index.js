const data = require('../data');

/**
 * Given an object of architecture data, update the data such that each entry
 * is keyed by name. For example:
 *
 * // Input
 * {
 *  "0": { "name": "foo" }
 * }
 *
 * // Output
 * {
 *  "foo": { "name": "foo" }
 * }
 */
const sanitize = (data) => {
  return Object.values(data)
    .map(({ name, ...rest }) => ({ [name]: { name, ...rest }}))
    .reduce((acc, o) => ({ ...acc, ...o }), {});
};
