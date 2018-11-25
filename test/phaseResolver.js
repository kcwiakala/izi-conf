const _ = require('lodash');
const expect = require('chai').expect;
const rereq = require('rereq');

describe('PhaseResolver', () => {

  let PhaseResolver = null;
  let originalEnv = _.clone(process.env);

  function requireFresh() {
    PhaseResolver = rereq('../lib/phaseResolver');
  }

  beforeEach(requireFresh);

  afterEach(() => {
    _.assign(process.env, originalEnv);
  });

  it('Should create default resolver if none provided', () => {
    let pr = new PhaseResolver();
    expect(pr.resolve()).to.equal('unknown');

    process.env['NODE_ENV'] = 'production';
    requireFresh();
    pr = new PhaseResolver();
    expect(pr.resolve()).to.equal('production');
  });

  it('Should throw exception if wrong resolver format provided', () => {
    let fn = () => new PhaseResolver('bla(prod)');
    expect(fn).to.throw(Error, /format/);
  });

  it('Should evaluate resolvers from left to right', () => {
    process.env['MY_ENV'] = 'staging';
    process.env['NODE_ENV'] = 'production';
    
    let pr1 = new PhaseResolver(['env(NODE_ENV)', 'env(MY_ENV)']);
    let pr2 = new PhaseResolver(['env(MY_ENV)', 'env(NODE_ENV)']);

    expect(pr1.resolve()).to.equal('staging');
    expect(pr2.resolve()).to.equal('production');
  });

  it('Should be able to parse string and bool process arguments', () => {
    process.argv.push('-p', 'prod', '--dev', '--staging');
    requireFresh();
    let pr = new PhaseResolver(['arg(p)']);
    expect(pr.resolve()).to.equal('prod');
    
    pr = new PhaseResolver(['arg(staging)']);
    expect(pr.resolve()).to.equal('staging');

    pr = new PhaseResolver(['arg(p)', 'arg(dev)']);
    expect(pr.resolve()).to.equal('dev');
  });
});