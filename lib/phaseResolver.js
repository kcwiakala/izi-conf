
const _ = require('lodash');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const RESOLVER = /\s*(arg|env)\s*\(\s*(\S+)\s*\)\s*/;

function envResolver(env_var) {
  return () => _.get(process.env, env_var);
}

function argResolver(arg) {
  if(arg.length === 1) {
    return () => _.get(argv, arg);
  } else {
    return () => (_.get(argv, arg) === true) ? arg : null;
  }
}

function createResolver(str) {
  const match = str.match(RESOLVER);
  if(match) {
    if(match[1] === 'arg') {
      return argResolver(match[2]);
    } else if (match[1] === 'env') {
      return envResolver(match[2]);
    }
  }
  throw Error(`Invalid phase resolver format: "${str}"`);
}

class PhaseResolver {
  constructor(resolvers) {
    this.resolvers = [];
    if(_.isString(resolvers)) {
      this.resolvers.push(createResolver(resolvers));
    } else if(_.isArray(resolvers)) {
      _.forEach(resolvers, r => {
        this.resolvers.push(createResolver(r));
      });
    } else {
      this.resolvers.push(envResolver('NODE_ENV'));
    }
  }

  resolve() {
    let phase = 'unknown';
    _.forEach(this.resolvers, r => {
      phase = r() || phase;
    });
    return phase;
  }
}

module.exports = PhaseResolver;