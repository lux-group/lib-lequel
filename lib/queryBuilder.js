// See test/queryBuilder_test.js for usage examples

function queryBuilder(initial_state) {
  let out = {};
  out.state = initial_state || {};

  let finalize = function () {
    let sql = "";
    let bound_vars = [];
    if (this.state.count) {
      sql = sql + " SELECT COUNT(*) "
    } else {
      sql = sql + " SELECT * "
    }
    if (this.state.from) {
      sql = sql + ` FROM ${this.state.from} `
    } else {
      throw "From must be supplied";
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


        } else {
          placeholder = "$" + bound_vars.push(value);
          statements.push(` ${column} ${operator} ${placeholder} `)
        }

      }
      sql = sql + " WHERE " + statements.join(" AND ");
    }

    if (this.state.orderBy) {
      sql = sql + ` ORDER BY ${this.state.orderBy[0]} ${this.state.orderBy[1]} `
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

  let orderBy = function (field, direction) {
    delete this.state.count;
    this.state.orderBy = [field, direction];
    return this;
  };
  out.orderBy = orderBy.bind(out);

  let where = function (field, operator, value) {
    this.state.wheres = this.state.wheres || [];
    this.state.wheres.push([field, operator, value]);
    return this;
  };
  out.where = where.bind(out);

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
