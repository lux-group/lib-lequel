module.exports = function (make_tsvector) {
    return `ts_rank(${make_tsvector}, to_tsquery_query)`;
}
  