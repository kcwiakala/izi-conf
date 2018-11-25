const _ = require('lodash');
const Configuration = require('./configuration');
const fs = require('fs');
const parser = require('./parser');
const path = require('path');
const utils = require('./utils');

class Loader {
  constructor() {
    this.modules = {};
    this.stack = [];
  }

  should_load(file) {
    if(!fs.existsSync(file)) {
      throw Error(`File doesn't exist: ${file}`);
    }
    if(_.indexOf(this.stack, file) >= 0) {
      throw Error('Cycle detected');
    }
    return !_.has(this.modules, file);
  }

  load(file) {
    if(this.should_load(file)) {
      this.stack.push(file);
      const content = fs.readFileSync(file, {encoding: 'utf-8'});
      let conf = new Configuration(file, content);
      _.forEach(conf.global_includes, include => this.load(include));
      this.load_inlines(conf);
      this.modules[file] = conf;
      this.stack.pop(file);
      return conf;
    }
  }

  load_inlines(conf) {
    parser.forEachExpression(conf.json, (obj, key, match) => {
      if(match[1] === 'include') {
        const include = utils.ensure_absolute(path.dirname(conf.file), match[2]);
        conf.inline_includes.push(include);
        let inline_conf = this.load(include);
        obj[key] = inline_conf.resolved;
      }
    });
  }
}

function absolute(base_dir, file) {
  return path.isAbsolute(file) ? child : path.join(base_dir, file);
}

module.exports = root => {
  if(!path.isAbsolute(root))  {
    throw Error(`Provide absolute path for root`);
  }
  const loader = new Loader();
  loader.load(root);
  return loader.modules;
};