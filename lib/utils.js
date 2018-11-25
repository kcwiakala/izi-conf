const path = require('path');

function ensure_absolute(base_dir, file) {
  return path.isAbsolute(file) ? child : path.join(base_dir, file);
}

function map_to_absolute(base_dir, arr) {
  return arr.map(element => ensure_absolute(base_dir, element));
}

exports.ensure_absolute = ensure_absolute;
exports.map_to_absolute = map_to_absolute;