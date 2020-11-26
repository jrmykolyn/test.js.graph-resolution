class LibraryNormalizer {
  API_DEPENDENCY_PREFIX = '@api/';
  SANITIZED_API_DEPENDENCY_PREFIX = '';
  API_DEPENDENCY_SUFFIX = '-client';
  SANITIZED_API_DEPENDENCY_SUFFIX = '-api';

  normalizeDependency(dependency) {
    if (dependency.startsWith(this.API_DEPENDENCY_PREFIX)) {
      return dependency
        .replace(this.API_DEPENDENCY_PREFIX, this.SANITIZED_API_DEPENDENCY_PREFIX)
        .replace(this.API_DEPENDENCY_SUFFIX, this.SANITIZED_API_DEPENDENCY_SUFFIX);
    }

    return dependency;
  }
}

class Normalizer {
  TYPE_LIBRARY = 'library';

  normalizeDependencyOfType(dependency, type) {
    switch (type) {
      case this.TYPE_LIBRARY: return new LibraryNormalizer().normalizeDependency(dependency);
      default: return dependency;
    }
  }
}

module.exports = {
  Normalizer,
  normalizer: new Normalizer(),
};
