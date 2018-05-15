module.exports = function (placeholder) {
    return `plainto_tsquery(${placeholder}) AS to_tsquery_query`;
}
  