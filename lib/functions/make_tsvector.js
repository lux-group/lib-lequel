const escape = require("pg-escape");

module.exports = function (fields, schema) {
    return escape((typeof schema !== 'undefined' ? schema + '.' : '') + 'make_tsvector(%s)', fields.join(','))
}
  