const escape = require("pg-escape");

module.exports = function (word) {
    return escape('to_tsquery(%L) AS to_tsquery_query', word)
}
  