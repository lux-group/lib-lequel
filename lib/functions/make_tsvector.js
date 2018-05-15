const add_schema = require('./schema');

module.exports = function (fields, schema) {
    return add_schema(schema, `make_tsvector(${fields.join(',')})`);
}
  