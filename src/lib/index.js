const { artifacts, ...rest } = require('../data');
const { keyOn } = require('./utils');

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
    .map(keyOn('name'))
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
  const _resolve = ({ dependencies, ...rest }, data, cache = {}) => ({
    ...rest,
    dependencies: dependencies.map(({ name, type }) => {
      cache[name] = cache[name] || _resolve(data[type][name], data, cache);
      return cache[name];
    }),
  });

  return Object.entries(rest)
    .map(([groupType, groupValues]) => ({
      [groupType]: Object.entries(groupValues)
        .map(([artifactName, artifactData]) => ({ [artifactName]: _resolve(artifactData, rest) }))
        .reduce((acc, o) =>  ({ ...acc, ...o }), {})
    }))
    .reduce((acc, o) => ({ ...acc, ...o }), {});
};

const sanitizedData = Object.entries(rest)
  .map(([key, value]) => ({ [key]: sanitize(value) }))
  .reduce((acc, o) => ({ ...acc, ...o }), { artifacts });

const intermediateData = intermediate(sanitizedData);

const resolvedData = resolve(intermediateData);

console.log(JSON.stringify(resolvedData, null, 2));
