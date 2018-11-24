
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const loader = require('./lib/loader');

const ROOT_DIR = path.dirname(require.main.filename);
const DEFAULT_CONFIG = path.join(ROOT_DIR, 'conf/default.json') ;

const keywords = ['root', 'require', 'include', 'common', 'prod', 'phase'];

// Configuration object
let _conf = {
  root: ROOT_DIR, 
  require: module => require(path.join(ROOT_DIR, module))
};

// Load config file with all its dependencies
function load(config_file) {
  const modules = loader(config_file);
  // console.log(modules);
  return {};
}

// Initialize configuration object
function init(config_file) {
  const configuration = load(config_file);
  _.merge(_conf, configuration);
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