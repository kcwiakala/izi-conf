

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const rereq = require('rereq');

describe('Creation', () => {

  describe('Default config file', () => {
    it('Should automatically load default configuration if present', () => {
      const config = rereq('../index.js');
      expect(config).to.be.an('object');
      expect(config.name).to.equal('default');
    });
  });

  describe('No default config file', () => {
    const default_config = path.join(__dirname, 'conf/default.json');
    const renamed_config = default_config + '.bak';
    before(() => {
      fs.renameSync(default_config, renamed_config);
    });
    after(() => {
      fs.renameSync(renamed_config, default_config);
    });

    it('Should create config as a function', () =>{
      const config = rereq('../index.js');
      expect(config).to.be.a('function');
    });

    it('Should throw exception if specified file doesn\'t exist', () => {
      const config = rereq('../index.js');
      const initializer = () => config('conf/wrong_filename.json');
      expect(initializer).to.throw(Error);
    });

    it('Should return object once properly initialized', () => {
      const config = rereq('../index.js')('conf/specific.json');

      const config2 = require('../index');
      expect(config2).to.be.an('object');
    });
  });

});