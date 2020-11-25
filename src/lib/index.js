const { artifacts, ...rest } = require('../data');

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

/**
 * Given an object of sanitized architecture data, update it such that primitive
 * dependencies are converted into their 'artifacts' equivalent.
 * is keyed by name. For example:
 *
 * // Input
 * {
 *   "applications": {
 *     "foo": {
 *       "name": "foo",
 *       "dependencies": ["bar"]
 *     }
 *   },
 *   "artifacts": {
 *     { "name": "bar", "type": "library" }
 *   ]
 * }
 *
 * // Output
 * {
 *   "applications": {
 *     "foo": {
 *       "dependencies": [
 *         { "name": "bar", "type": "library" }
 *       ]
 *     }
 *   },
 *   "artifacts": {
 *     { "name": "bar", "type": "library" }
 *   ]
 * }
 */
const intermediate = ({ artifacts, ...rest }) => {
  return Object.entries(rest)
    .map(([key, value]) => ({
      [key]: Object.entries(value)
        .map(([k, { dependencies = [], ...r }]) => ({
          [k]: {
            ...r,
            dependencies: dependencies.map((dependency) => artifacts.find(({ name }) => name === dependency)),
          }
        }))
        .reduce((acc, o) => ({ ...acc, ...o }), {}),
    }))
    .reduce((acc, o) => ({ ...acc, ...o }), { artifacts });
};

/**
 * Given an object of sanitize artifact data, generate and return a fully
 * resolved dependency tree. For example:
 *
 * // Input
 * {
 *   "applications": {
 *     "foo": {
 *       "name": "foo",
 *       "dependencies": ["bar"]
 *     }
 *   },
 *   "libraries": {
 *     "bar": {
 *       "name": "bar"
 *     }
 *   }
 * }
 *
 * // Output
 * {
 *   "applications": {
 *     "foo": {
 *       "dependencies": [
 *         "bar": {
 *           "name": "bar"
 *         }
 *       ]
 *     }
 *   },
 *   "libraries": {
 *     "bar": {
 *       "name": "bar"
 *     }
 *   }
 * }
 */
const resolve = ({ artifacts, ...rest }) => {
  return Object.entries(rest)
    .map(([key, value]) => ({
      [key]: Object.values(value)
      .map(({ dependencies, ...r }) => ({
        ...r,
        dependencies: dependencies.map(({ name, type }) => rest[type][name]),
      })),
    }))
    .reduce((acc, o) => ({ ...acc, ...o }), {});
};

const sanitizedData = Object.entries(rest)
  .map(([key, value]) => ({ [key]: sanitize(value) }))
  .reduce((acc, o) => ({ ...acc, ...o }), { artifacts });

const intermediateData = intermediate(sanitizedData);

const resolvedData = resolve(intermediateData);

console.log(JSON.stringify(resolvedData, null, 2));
