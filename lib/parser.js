const _ = require('lodash');

const EXPRESSION = /['"]?\s*{{\s*(include|env)\s*\(\s*(\S+)\s*\)\s*}}\s*['"]?/;

function forEachExpression(obj, cb) {
  _.forEach(obj, (value, key) => {
    if(_.isObject(value) || _.isArray(value)) {
      forEachExpression(value, cb);
    } else if (_.isString(value)) {
      const match = value.match(EXPRESSION);
      if(match) {
        cb(obj, key, match);
      }
    }
  });
}

exports.forEachExpression = forEachExpression;