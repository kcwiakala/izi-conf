const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const EXPRESSION = /['"]?\s*{{\s*(include|env)\s*\(\s*(\S+)\s*\)\s*}}\s*['"]?/;

function absolute(base_dir, file) {
  return path.isAbsolute(file) ? child : path.join(base_dir, file);
}

class Loader {
  constructor(root_conf) {
    this.loaded = {};
  }
}

function read(file, stack, loaded) {
  if(!fs.existsSync(file)) {
    throw Error(`File doesn't exist: ${file}`);
  }
  if(_.indexOf(stack, file) >= 0) {
    throw Error('Cycle detected');
  }
  if(!_.has(loaded, file)) {
    stack.push(file);
    const content = fs.readFileSync(file, {encoding: 'utf-8'});
    let json = JSON.parse(content);
    
    let conf = new Configuration(file, json);
    _.forEach(conf.global_includes, include => load(include, stack, loaded));
    loaded[file] = conf;
    parse(file, conf.json, stack, loaded);
    return conf;
  }
}
 
function parse(file, obj, stack, loaded) {
  _.forEach(obj, (value, key) => {
    if(_.isObject(value) || _.isArray(value)) {
      parse(file, value, stack, loaded);
    } else if (_.isString(value)) {
      const match = value.match(EXPRESSION);
      if(match) {
        if(match[1] === 'include') {
          const include = absolute(path.dirname(file), match[2]);
          loaded[file].inline_includes.push(include);
          let conf = read(include, stack, loaded);
          obj[key] = conf.resolved;
        }
      }
    }
  });
}

class Configuration {
  constructor(file, json) {
    this.json = json;
    
    const base_dir = path.dirname(file);
    const obligatory_includes = _.get(json, 'include', []).map(inc => absolute(base_dir, inc));
    let optional_includes = _.get(json, 'optional', []).map(inc => absolute(base_dir, inc));
    optional_includes = _.remove(optional_includes, include => !fs.existsSync(include));

    this.global_includes = _.concat(obligatory_includes, optional_includes)
    this.inline_includes = [];
    this.resolved = {};
    this.isResolved = false;
  }

  resolve(phase, configurations) {
    if(!this.isResolved) {
      const includes = _.concat(this.global_includes, this.inline_includes);
      _.forEach(_.uniq(includes), include => {
        const config = _.get(configurations, include);
        if(config) {
          config.resolve(phase, configurations);
        }
      });
      _.merge(this.resolved, this.json.common);
      _.merge(this.resolved, _.get(this.json, phase));
      _.forEach(this.global_includes, include => {
        const config = _.get(configurations, include);
        _.merge(this.resolved, config.resolved);
      });
      this.isResolved = true;
    }
    return this.resolved;
  }
}

module.exports = root => {
  if(!path.isAbsolute(root))  {
    throw Error(`Provide absolute path for root`);
  }
  const loaded = {};
  const stack = [];
  read(root, stack, loaded);
  return loaded;
};