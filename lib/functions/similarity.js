module.exports = function (field, placeholder) {
    return `similarity(${field}, ${placeholder})`;
}
  