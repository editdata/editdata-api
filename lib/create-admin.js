var createTownship = require('township')

module.exports = function (db, config) {
  var township = createTownship(db, config)

  return function create (creds, callback) {
    township.accounts.register(creds, callback)
  } 
}
