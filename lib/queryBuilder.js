// See test/queryBuilder_test.js for usage examples

const {similarity, plainto_tsquery, add_schema, make_tsvector, ts_rank} = require('./functions/index');

function queryBuilder(initial_state) {
  let out = {};
  out.state = initial_state || {};

  let finalize = function () {
    let sql = "";
    let bound_vars = [];
    if (this.state.count) {
      sql = sql + " SELECT COUNT(*)"
    } else {
      if(!this.state.select){
        this.state.select = ['*'];
      }
      sql = sql + " SELECT " + this.state.select.join(", ")
    }
    if (this.state.from) {
      sql = sql + ` FROM ${add_schema(this.state.schema, this.state.from)} `
    } else {
      throw "From must be supplied";
    }
    if (this.state.tsquery) {
      sql = sql + ` ,${plainto_tsquery("$" + bound_vars.push(this.state.tsquery))} `
    }

    if (this.state.wheres) {
      let statements = [],
        placeholder;
      for (where of this.state.wheres) {
        let column = where[0],
          operator = where[1],
          value = where[2];

        if (operator == 'in') {
          let inPlaceholder = [];
          for (let i = 0; i < value.length; i++) {
            placeholder = "$" + bound_vars.push(value[i]);
            inPlaceholder.push(placeholder);
          }
          statements.push(` ${column} in (${inPlaceholder.join(",")}) `);

        } else if(operator.toLowerCase() == 'like'){
          placeholder = "$" + bound_vars.push(`%${value}%`);
          statements.push(` ${column} ${operator} ${placeholder} `)

        } else if(operator.toLowerCase() == 'ilike'){
          placeholder = "$" + bound_vars.push(`%${value}%`);
          statements.push(` ${column} ${operator} ${placeholder} `)

        } else if ((operator == 'IS' || operator == 'IS NOT') && (value == 'NULL')) {
          statements.push(`${column} ${operator} NULL`)

        } else if (operator == 'make_tsvector') {
          statements.push(`${column} @@ to_tsquery_query`)

        } else {
          placeholder = "$" + bound_vars.push(value);
          statements.push(` ${column} ${operator} ${placeholder} `)
        }

      }
      sql = sql + " WHERE " + statements.join(" AND ");
    }

    if (this.state.orderBy) {
      let ordersBy = [];
      for (order of this.state.orderBy) {
        let column = order[0],
          direction = order[1],
          orderParams = order[2];

        if(orderParams){
            if(orderParams.function == 'similarity'){
              column = similarity(column, "$" + bound_vars.push(orderParams.values.pop()));
            }
        }

        ordersBy.push(`${column} ${direction}`)
      }

      sql = sql + " ORDER BY " + ordersBy.join(", ");
    }

    if (this.state.paginate) {
      let per_page = this.state.paginate[1];
      let page = this.state.paginate[0];
      let limit = per_page;
      let offset = (page - 1) * limit;
      sql = sql + ` LIMIT ${limit} OFFSET ${offset} `
    }

    return [sql, bound_vars];
  };
  out.finalize = finalize.bind(out);

  // Operations:

  let from = function (from) {
    this.state.from = from;
    return this;
  };
  out.from = from.bind(out);

  let select = function (fields) {
    this.state.select = fields;
    return this;
  };
  out.select = select.bind(out);

  let addSelect = function (field) {
    this.state.select = this.state.select || [];
    this.state.select.push(field);
    return this;
  };
  out.addSelect = addSelect.bind(out);
  
  let orderBy = function (field, direction) {
    delete this.state.count;
    this.state.orderBy = [];
    this.state.orderBy.push([field, direction, null]);
    return this;
  };
  out.orderBy = orderBy.bind(out);

  let addOrderBy = function (field, direction) {
    delete this.state.count;
    this.state.orderBy = this.state.orderBy || [];
    this.state.orderBy.push([field, direction, null]);
    return this;
  };
  out.addOrderBy = addOrderBy.bind(out);

  let addOrderByFunction = function (functionName, field, values, direction) {
    delete this.state.count;
    this.state.orderBy = this.state.orderBy || [];
    this.state.orderBy.push([field, direction, {
      function: functionName,
      values: values || []
    }]);
    return this;
  };
  out.addOrderByFunction = addOrderByFunction.bind(out);

  let where = function (field, operator, value) {
    this.state.wheres = this.state.wheres || [];
    this.state.wheres.push([field, operator, value]);

    return this;
  };
  out.where = where.bind(out);

  let schema = function (name) {
    this.state.schema = name;

    return this;  
  };
  out.schema = schema.bind(out);

  let fullTextSearch = function (fields, word, direction) {
    this.state.tsquery = word;
    let tsvector = make_tsvector(fields, this.state.schema);
    this.where(tsvector, 'make_tsvector');

    if(typeof direction !== 'undefined'){
      this.addOrderBy(ts_rank(tsvector), direction);
    }

    return this;
  };
  out.fullTextSearch = fullTextSearch.bind(out);

  let paginate = function (page, per_page) {
    if (!per_page) {
      per_page = 10;
    }
    this.state.paginate = [parseInt(page), parseInt(per_page)];
    return this;
  };
  out.paginate = paginate.bind(out);

  let count = function () {
    this.state.count = true;
    delete this.state.orderBy;
    return this;
  };
  out.count = count.bind(out);

  let clone = function () {
    // Deep clone the state
    return queryBuilder(JSON.parse(JSON.stringify(this.state)))
  };
  out.clone = clone.bind(out);

  // Returns empty resultset
  let returnNoResults = function () {
    this.where("1", "=", 0);
    return this;
  };
  out.returnNoResults = returnNoResults.bind(out);

  return out;
}
module.exports = queryBuilder;
