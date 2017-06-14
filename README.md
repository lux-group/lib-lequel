leQuel Library
===

leQuel provides a simple API to connect to and query postgres database.

### Requires
env.DATABASE_URL
```
DATABASE_URL=postgresql://@localhost/my_db
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


