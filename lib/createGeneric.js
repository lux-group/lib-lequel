const db = require('./index.js');
function createGeneric(table, settable_fields, object) {
  let set_fields = settable_fields.filter(function (field) {
    return Object.keys(object).includes(field);
  });
  let values = set_fields.map(function (field) {
    return object[field];
  });
  let counter = 0;
  let placeholders = set_fields.map(function () {
    counter = counter + 1;
    return "$" + counter;
  });

  let query = `
    INSERT INTO ${table} (
      ${set_fields.join(",")}
    ) VALUES (
      ${placeholders}
    ) RETURNING *;
  `
  return db.getFirstRow(query, values);
}
module.exports = createGeneric;
