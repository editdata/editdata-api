var path = require('path')
var xtend = require('xtend')

var config = {
  shared: {
    host: 'http://127.0.0.1',
    port: 3322,
    secret: 'this is not very secret',
    dbpath: path.join(__dirname, 'db'),
    publicRegistration: true,
    allowedEmails: [], // only used if publicRegistration is false
    scopes: {
      app: {
        admin: 'app:admin'
      },
      datasets: {
        read: 'datasets:read',
        write: 'datasets:write',
        destroy: 'datasets:destroy'
      }
    },
    emailTransport: `smtps://${process.env.GMAIL_USER}%40gmail.com:${process.env.GMAIL_PASS}@smtp.gmail.com`,
    fromEmail: 'hi@editdata.org',
    clientHost: 'http://127.0.0.1:9966'
  },
  production: {
    secret: process.env.EDITDATA_SECRET,
    clientHost: 'https://new.editdata.org'
  }
}

var env = process.env.NODE_ENV || 'development'
module.exports = xtend(config.shared, config[env])
