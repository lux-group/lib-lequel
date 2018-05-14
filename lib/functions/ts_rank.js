const escape = require("pg-escape");

module.exports = function (make_tsvector) {
    return escape('ts_rank(%s, to_tsquery_query)', make_tsvector)
}
  