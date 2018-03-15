const escape = require("pg-escape");

module.exports = function (field, word) {
    return escape('similarity(%I, %L)', field, word)
}
  