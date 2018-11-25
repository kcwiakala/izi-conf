const expect = require('chai').expect;
const loader = require('../lib/loader');
const path = require('path');

describe('Loader', () => {
  it('Should accept only absolute paths for load root', () => {
    expect(() => loader('conf/default.json')).to.throw(Error, /absolute/);
  });

  it('Should detect include cycle', () => {
    const file = path.join(__dirname, 'conf/cycle.json');
    expect(() => loader(file)).to.throw(Error, /Cycle detected/); 
  });
});