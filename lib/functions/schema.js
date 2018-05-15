module.exports = function (schema, name) {
    return (typeof schema !== 'undefined' ? schema + '.' : '') + name;
}
  