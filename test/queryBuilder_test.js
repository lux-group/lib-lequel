const expect  = require("chai").expect;

const queryBuilder = require('../lib/queryBuilder');

describe('queryBuilder', function() {
  describe('queries', function() {

    it('should accept from', function() {
      query = queryBuilder();
      query.from("a_thing");
      expect([" SELECT * FROM a_thing ", []]).to.eql(query.finalize());
    });

    it('with multiple froms, the last should win', function() {
      query = queryBuilder();
      query.from("a_thing");
      query.from("banana");
      expect([" SELECT * FROM banana ", []]).to.eql(query.finalize());
    });

    it('should accept count', function() {
      query = queryBuilder();
      query.from("banana");
      query.count();
      expect([" SELECT COUNT(*) FROM banana ", []]).to.eql(query.finalize());
    });

    it('should accept order by', function() {
      query = queryBuilder();
      query.from("banana");
      query.orderBy("species", "ASC");
      expect([" SELECT * FROM banana  ORDER BY species ASC", []]).to.eql(query.finalize());
    });

    it('should clear order by when calling count', function() {
      query = queryBuilder();
      query.from("banana");
      query.orderBy("species", "ASC");
      query.count();
      expect([" SELECT COUNT(*) FROM banana ", []]).to.eql(query.finalize());
    });

    it('should clear count by when calling order by', function() {
      query = queryBuilder();
      query.from("banana");
      query.count();
      query.orderBy("species", "ASC");

      expect([" SELECT * FROM banana  ORDER BY species ASC", []]).to.eql(query.finalize());
    });

    it('with multiple order bys, the last should win', function() {
      query = queryBuilder();
      query.from("banana");
      query.orderBy("peel", "DESC");
      query.orderBy("species", "ASC");
      expect([" SELECT * FROM banana  ORDER BY species ASC", []]).to.eql(query.finalize());
    });

    it('should accept pagination', function() {
      query = queryBuilder();
      query.from("banana");
      query.paginate(5, 5);
      expect([" SELECT * FROM banana  LIMIT 5 OFFSET 20 ", []]).to.eql(query.finalize());
    });

    it('should accept string pagination', function() {
      query = queryBuilder();
      query.from("banana");
      query.paginate("5", "5");
      expect([" SELECT * FROM banana  LIMIT 5 OFFSET 20 ", []]).to.eql(query.finalize());
    });

    it('should sanitize garbage in pagination', function() {
      query = queryBuilder();
      query.from("banana");
      query.paginate("5bbbb", "5aaaa");
      expect([" SELECT * FROM banana  LIMIT 5 OFFSET 20 ", []]).to.eql(query.finalize());
    });

    it('with multiple paginates, the last should win', function() {
      query = queryBuilder();
      query.from("banana");
      query.paginate(2, 2);
      query.paginate(5, 5);
      expect([" SELECT * FROM banana  LIMIT 5 OFFSET 20 ", []]).to.eql(query.finalize());
    });

    it('should accept where', function() {
      query = queryBuilder();
      query.from("banana");
      query.where("species","=", "cavendish");
      expect([" SELECT * FROM banana  WHERE  species = $1 ", ["cavendish"]]).to.eql(query.finalize());
    });

    it('should compose multiple wheres', function() {
      query = queryBuilder();
      query.from("banana");
      query.where("species","=", "cavendish");
      query.where("state","=", "ripe");
      expect([
        " SELECT * FROM banana  WHERE  species = $1  AND  state = $2 "
        , ["cavendish", "ripe"]]).to.eql(query.finalize());
    });

    it('should compose multiple where ins', function() {
      query = queryBuilder();
      query.from("banana");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","in", ['ape','cat']);
      expect([
        " SELECT * FROM banana  WHERE  species in ($1,$2)  AND  feeder in ($3,$4) "
        ,["cavendish","alchemist","ape","cat"]]).to.eql(query.finalize());
    });

    it('should compose multiple where in and where equals', function() {
      query = queryBuilder();
      query.from("banana");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      expect([
        " SELECT * FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3 "
        ,["cavendish","alchemist","ape"]]).to.eql(query.finalize());
    });

    it('should compose where like', function() {
      query = queryBuilder();
      query.from("sports");
      query.where("name","like", "football");
      expect([
        " SELECT * FROM sports  WHERE  name like $1 "
        ,["%football%"]]).to.eql(query.finalize());
    });

    it('should compose where ilike', function() {
      query = queryBuilder();
      query.from("sports");
      query.where("name","ilike", "Football");
      expect([
        " SELECT * FROM sports  WHERE  name ilike $1 "
        ,["%Football%"]]).to.eql(query.finalize());
    });

    it('should compose where IS NULL', function() {
      query = queryBuilder();
      query.from("sports");
      query.where("name","IS", "NULL");
      expect([
        " SELECT * FROM sports  WHERE name IS NULL",[]]).to.eql(query.finalize());
    });

    it('should compose multiple where in  with where like and where equals', function() {
      query = queryBuilder();
      query.from("banana");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      query.where("name","like", "Football");
      expect([
        " SELECT * FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3  AND  name like $4 "
        ,["cavendish","alchemist","ape","%Football%"]]).to.eql(query.finalize());
    });

    it('should compose multiple where in  with where ilike and where equals', function() {
      query = queryBuilder();
      query.from("banana");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      query.where("name","ilike", "Football");
      expect([
        " SELECT * FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3  AND  name ilike $4 "
        ,["cavendish","alchemist","ape","%Football%"]]).to.eql(query.finalize());
    });

    it('should clone into separate queries', function() {
      query = queryBuilder();
      query.from("banana");
      second_query = query.clone();
      second_query.count();
      expect([" SELECT * FROM banana " , []]).to.eql(query.finalize());
      expect([" SELECT COUNT(*) FROM banana " , []]).to.eql(second_query.finalize());
    });

    it('should compose all query types and clone cleanly', function() {
      query = queryBuilder();
      query.from("banana");
      query.orderBy("species", "ASC");
      query.where("species","=", "cavendish");
      query.where("state","=", "ripe");
      second_query = query.clone();
      second_query.count();
      query.paginate(5, 5);
      expect([" SELECT * FROM banana  WHERE  species = $1  AND  state = $2  ORDER BY species ASC LIMIT 5 OFFSET 20 " , ["cavendish", "ripe"]]).to.eql(query.finalize());
      expect([" SELECT COUNT(*) FROM banana  WHERE  species = $1  AND  state = $2 ",["cavendish", "ripe"]]).to.eql(second_query.finalize());
    });

    it('should compose custom select fields', function() {
      query = queryBuilder();
      query.from("banana");
      query.select(["first_name"]);
      query.addSelect("last_name");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      expect([
        " SELECT first_name, last_name FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3 "
        ,["cavendish","alchemist","ape"]]).to.eql(query.finalize());
    });

    it('should compose custom select fields and several orders', function() {
      query = queryBuilder();
      query.from("banana");
      query.select(["first_name"]);
      query.addSelect("last_name");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      query.orderBy("species", "ASC");
      query.addOrderBy("first_name", "DESC");
      expect([
        " SELECT first_name, last_name FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3  ORDER BY species ASC, first_name DESC"
        ,["cavendish","alchemist","ape"]]).to.eql(query.finalize());
    });

    it('should compose custom select fields and several orders with order by function', function() {
      query = queryBuilder();
      query.from("banana");
      query.select(["first_name"]);
      query.addSelect("last_name");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      query.orderBy("species", "ASC");
      query.addOrderBy("first_name", "DESC");
      query.addOrderByFunction('similarity', 'species', ['cavendish'], 'DESC')
      expect([
        " SELECT first_name, last_name FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3  ORDER BY species ASC, first_name DESC, similarity(species, $4) DESC"
        ,["cavendish","alchemist","ape", "cavendish"]]).to.eql(query.finalize());
    });

    it('should compose all query types and full text search', function() {
      query = queryBuilder();
      query.from("banana");
      query.orderBy("species", "ASC");
      query.where("species","=", "cavendish");
      query.where("state","=", "ripe");
      query.fullTextSearch(['name'], 'Test Name', 'DESC');
      second_query = query.clone();
      second_query.count();
      query.paginate(5, 5);

      expect([" SELECT * FROM banana  ,plainto_tsquery($1) AS to_tsquery_query  WHERE  species = $2  AND  state = $3  AND make_tsvector(name) @@ to_tsquery_query ORDER BY species ASC, ts_rank(make_tsvector(name), to_tsquery_query) DESC LIMIT 5 OFFSET 20 " , ["Test Name", "cavendish", "ripe"]]).to.eql(query.finalize());
      expect([" SELECT COUNT(*) FROM banana  ,plainto_tsquery($1) AS to_tsquery_query  WHERE  species = $2  AND  state = $3  AND make_tsvector(name) @@ to_tsquery_query",["Test Name", "cavendish", "ripe"]]).to.eql(second_query.finalize());
    });
    
    it('should compose all query types and full text search without order', function() {
      query = queryBuilder();
      query.from("banana");
      query.orderBy("species", "ASC");
      query.where("species","=", "cavendish");
      query.where("state","=", "ripe");
      query.fullTextSearch(['name'], 'Test Name');
      second_query = query.clone();
      second_query.count();
      query.paginate(5, 5);

      expect([" SELECT * FROM banana  ,plainto_tsquery($1) AS to_tsquery_query  WHERE  species = $2  AND  state = $3  AND make_tsvector(name) @@ to_tsquery_query ORDER BY species ASC LIMIT 5 OFFSET 20 " , ["Test Name", "cavendish", "ripe"]]).to.eql(query.finalize());
      expect([" SELECT COUNT(*) FROM banana  ,plainto_tsquery($1) AS to_tsquery_query  WHERE  species = $2  AND  state = $3  AND make_tsvector(name) @@ to_tsquery_query",["Test Name", "cavendish", "ripe"]]).to.eql(second_query.finalize());
    });

    it('should compose all query types and full text search and add schema', function() {
      query = queryBuilder();
      query.schema("test_schema");
      query.from("banana");
      query.orderBy("species", "ASC");
      query.where("species","=", "cavendish");
      query.where("state","=", "ripe");
      query.fullTextSearch(['name'], 'Test Name', 'DESC');
      second_query = query.clone();
      second_query.count();
      query.paginate(5, 5);

      expect([" SELECT * FROM test_schema.banana  ,plainto_tsquery($1) AS to_tsquery_query  WHERE  species = $2  AND  state = $3  AND test_schema.make_tsvector(name) @@ to_tsquery_query ORDER BY species ASC, ts_rank(test_schema.make_tsvector(name), to_tsquery_query) DESC LIMIT 5 OFFSET 20 " , ["Test Name", "cavendish", "ripe"]]).to.eql(query.finalize());
      expect([" SELECT COUNT(*) FROM test_schema.banana  ,plainto_tsquery($1) AS to_tsquery_query  WHERE  species = $2  AND  state = $3  AND test_schema.make_tsvector(name) @@ to_tsquery_query",["Test Name", "cavendish", "ripe"]]).to.eql(second_query.finalize());
    });

    it('test injection', function() {
      query = queryBuilder();
      query.from("banana");
      query.select(["first_name"]);
      query.addSelect("last_name");
      query.where("species","in", ['cavendish','alchemist']);
      query.where("feeder","=", 'ape');
      query.orderBy("species", "ASC");
      query.addOrderBy("first_name", "DESC");
      query.addOrderByFunction('similarity', 'species', ['\'; (select * from banana);'], 'DESC')
      expect([
        " SELECT first_name, last_name FROM banana  WHERE  species in ($1,$2)  AND  feeder = $3  ORDER BY species ASC, first_name DESC, similarity(species, $4) DESC"
        ,["cavendish","alchemist","ape",'\'; (select * from banana);']]).to.eql(query.finalize());
    });

  });
});

