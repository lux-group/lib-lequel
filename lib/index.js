const Pool = require("pg-pool"),
  url = require("url");

if (!process.env.DATABASE_URL) {
  throw new Error("Environment variable DATABASE_URL is not set");
}
const params = url.parse(process.env.DATABASE_URL);
let ssl = (process.env.NODE_ENV === 'production'),
  auth = params.auth.split(':'),
  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: ssl
  };
const pool = new Pool(config);

let query = (text, values_in) => {
  let values = values_in || [];
  console.log("SQL: " + text + " with values " + values.join(","));
  return pool.query(text, values)
};

module.exports.query = query;

module.exports.getRows = (text, values) => {
  return query(text, values).then(res => {
    return res.rows;
  });
};

module.exports.getFirstRow = (text, values) => {
  return query(text, values).then(res => {
    return res.rows[0];
  });
};

module.exports.getCount = (text, values) => {
  return query(text, values).then(res => {
    return parseInt(res.rows[0].count);
  });
};
