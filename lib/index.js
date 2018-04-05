const Pool = require("pg-pool");
const url = require("url");

let databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("Environment variable is not set");
}
module.exports.setDatabaseUrl = (url) => databaseUrl = url
module.exports.getDatabaseUrl = () => databaseUrl

let current_config
let configure = (overrides) => {
  let params = url.parse(databaseUrl);
  let ssl = (process.env.NODE_ENV === 'production');
  let auth = params.auth.split(':');
  current_config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: ssl,
    statement_timeout: 15000, //default to 15 seconds timeout
    idleTimeoutMillis: 30000 //close idle clients after 30 seconds
  };
  current_config = {...current_config, ...overrides}
}
module.exports.configure = configure;

let pool
let getPool = () => {
  if (!pool) {
    pool = new Pool(current_config)
  }
  return pool
}
module.exports.getPool = getPool;

let query = (text, values_in) => {
  let values = values_in || [];
  console.log("SQL: " + text + " with values " + values.join(","));
  return getPool().query(text, values)
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

module.exports.createGeneric = require('./createGeneric');
module.exports.upsert = require('./upsert');
module.exports.queryBuilder = require('./queryBuilder');

module.exports.configure = configure
