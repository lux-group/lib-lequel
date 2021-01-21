const Pool = require("pg-pool"),
  url = require("url");

const { PGSSLMODE } = process.env

let databaseUrl = process.env.DATABASE_URL

let logSql = process.env.LOG_SQL

if (!databaseUrl) {
  throw new Error("Environment variable is not set");
}
module.exports.setDatabaseUrl = (url) => databaseUrl = url
module.exports.getDatabaseUrl = () => databaseUrl

const params = url.parse(databaseUrl);
let ssl = ( PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false),
  auth = params.auth.split(':'),
  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: ssl,
    idleTimeoutMillis: 30000 //close idle clients after 30 seconds
  };
let pool = new Pool(config);

let query = (text, values_in) => {
  let values = values_in || [];
  if (logSql){
    console.log("SQL: " + text + " with values " + values.join(","));
  }
  return pool.query(text, values)
};

function configure(overrides) {
  pool = new Pool(Object.assign(config, overrides))
}

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

module.exports.createGeneric = require('./createGeneric');
module.exports.upsert = require('./upsert');
module.exports.queryBuilder = require('./queryBuilder');
module.exports.pool = pool
module.exports.configure = configure
