const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

class Configuration {
  constructor(file, content) {
    this.file = file;
    this.json = JSON.parse(content);
    
    const base_dir = path.dirname(file);
    const obligatory_includes = utils.map_to_absolute(base_dir,_.get(this.json, 'include', []));
    let optional_includes = utils.map_to_absolute(base_dir,_.get(this.json, 'optional', []));
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

module.exports = Configuration;