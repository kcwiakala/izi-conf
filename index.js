
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const loader = require('./lib/loader');
const PhaseResolver = require('./lib/phaseResolver');

const ROOT_DIR = path.dirname(require.main.filename);
const DEFAULT_CONFIG = path.join(ROOT_DIR, 'conf/default.json') ;

const keywords = ['root', 'require', 'phase', 'warnings'];

// Configuration object
let _conf = {
  root: ROOT_DIR, 
  require: module => require(path.join(ROOT_DIR, module)),
  warnings: []
};

// Initialize configuration object
function init(config_file) {
  const modules = loader(config_file);
  const main = modules[config_file];
  const phaseResolver = new PhaseResolver(main.json.phase);
  _conf.phase = phaseResolver.resolve();
  main.resolve(_conf.phase, modules);

  let conf = main.resolved;
  _.forEach(keywords, keyword => {
    if(_.has(conf, keyword)) {
      _.unset(conf, keyword);
      _conf.warnings.push(`"${keyword}" is a reserved keyword and should not be used`);
    }
  });
  _.merge(_conf, conf);
}

if(fs.existsSync(DEFAULT_CONFIG)) {
  init(DEFAULT_CONFIG);
  module.exports = _conf;
} else {
  module.exports = config_file => {
    if(!path.isAbsolute(config_file)) {
      config_file = path.join(ROOT_DIR, config_file);
    }
    if(!fs.existsSync(config_file)) {
      throw Error(`File ${config_file} doesn't exist`);
    }
    init(config_file);
    module.exports = _conf;
    return _conf;
  }
}