var createApp = require('appa')
var send = require('appa/send')
var createTownship = require('township')
var createReset = require('township-reset-password-token')
var createEmail = require('township-email')

module.exports = function createServer (db, config) {
  var app = createApp({ log: config.log })
  var township = createTownship(db, config)
  var reset = createReset(db, config)
  var email = createEmail({ transport: config.emailTransport })

  config.township = township
  config.reset = reset
  config.email = email

  var accounts = require('./handlers/accounts')(config)
  var datasets = require('./handlers/datasets')(db, config)

  app.on('/', function (req, res, ctx) {
    send({ message: 'welcome to editdata!' }).pipe(res)
  })

  /* Accounts routes */
  app.on('/accounts/register', accounts.register)
  app.on('/accounts/login', accounts.login)
  app.on('/accounts/verify', accounts.verify)
  app.on('/accounts/logout', accounts.logout)
  app.on('/accounts/destroy', accounts.destroy)
  app.on('/accounts/password-reset/:email', accounts.passwordReset)
  app.on('/accounts/password-reset-confirm/', accounts.passwordResetConfirm)

  /* Datasets routes */
  app.on('/datasets', function (req, res, ctx) {
    if (req.method === 'GET') return datasets.list(req, res, ctx)
    if (req.method === 'POST') return datasets.create(req, res, ctx)
  })

  app.on('/datasets/:dataset', function (req, res, ctx) {
    if (req.method === 'GET') return datasets.read(req, res, ctx)
    if (req.method === 'PUT') return datasets.update(req, res, ctx)
    if (req.method === 'DELETE') return datasets.destroy(req, res, ctx)
  })

  app.on('/datasets/:dataset/rows', function (req, res, ctx) {
    if (req.method === 'POST') return datasets.addRow(req, res, ctx)
  })

  return app
}
