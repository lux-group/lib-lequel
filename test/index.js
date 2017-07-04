const expect = require('chai').expect

describe('it can load', () => {
  afterEach(() => {
    process.env.DATABASE_URL = null
  })
  it('default env variable as database connection', () => {
    process.env.DATABASE_URL = 'postgresql://@localhost/my_db';
    const lequel = require('../lib/')
    expect(lequel.getDatabaseUrl()).to.eql('postgresql://@localhost/my_db')
  })

  it('custom env variable as database connection', () => {
    process.env.MY_DATABASE_URL = 'postgresql://@localhost/my_db_test';
    const lequel = require('../lib/')
    lequel.setDatabaseUrl(process.env.MY_DATABASE_URL)
    expect(lequel.getDatabaseUrl()).to.eql('postgresql://@localhost/my_db_test')
  })
})
