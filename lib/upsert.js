const db = require('./index.js');
module.exports = function (object, table, settable_fields, upsert_index) {
  if(!(upsert_index in object)){
    throw new Error(upsert_index+" is required for upsert.")
  }
  let set_fields = settable_fields.filter(function(field){
    return Object.keys(object).includes(field);
  });

  let values = set_fields.map(function(field){
    return object[field];
  });
  let counter = 0;
  let placeholders = set_fields.map(function() {
    counter = counter + 1;
    return "$" + counter;
  });

  let query = `
    INSERT INTO ${table} (
      ${set_fields.join(",")}
    ) VALUES (
      ${placeholders}
    )
    ON CONFLICT (${upsert_index})
    DO
      UPDATE SET (
        ${set_fields.join(",")}
      ) = (
        ${placeholders}
      )
      WHERE orders.${upsert_index} = '${object[upsert_index]}'
      RETURNING *;
  `
  return db.getFirstRow(query, values);
}
