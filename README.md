# Deprecated

We recommed you migrate away from lib-lequel. It hasn't been maintained in years. Our most common ORM is Sequelize.

- Joss Paling, March 2024



leQuel Library
===

leQuel provides a simple API to connect to and query postgres database.

### Default database path
env.DATABASE_URL
```
DATABASE_URL=postgresql://@localhost/my_db
```
### For custom database path
env.MY_DATABASE_URL
```
MY_DATABASE_URL=postgresql://@localhost/my_db_test
```

```javascript
const lequel = require('lib-lequel');
lequel.setDatabaseUrl(process.env.MY_DATABASE_URL)
```

### Examples
```javascript
const lequel = require('lib-lequel');

let query = lequel.queryBuilder();
query.from("a_thing");
query.where("species","=", "cavendish");
query.orderBy("species", "ASC");
query.paginate(5, 5);

let result = lequel.getRows(...query.finalize());
```
