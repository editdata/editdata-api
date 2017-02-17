#!/usr/bin/env node

var exit = require('exit')
var level = require('level-party')

var config = require('../config')
var db = level(config.dbpath)
var createAdmin = require('../lib/create-admin')(db, config)

var email = process.argv[2]
var password = process.argv[3]
var scopes = config.scopes

if (!email) {
  error('email is required', { usage: true })
}

if (!password) {
  error('password is required', { usage: true })
}

var creds = {
  email: email,
  password: password,
  scopes: [
    scopes.app.admin,
    scopes.datasets.read,
    scopes.datasets.write,
    scopes.datasets.destroy
  ]
}

createAdmin(creds, function (err, account) {
  if (err) return error(err.message)
  console.log('account created')
  console.log('key', account.key)
  console.log('account', account)
})

function error (msg, opts) {
  opts = opts || {}
console.log(`
ERROR:
  ${msg}
`)
  if (opts.usage) usage()
  exit(1)
}

function usage () {
console.log(`
USAGE:
  ./bin/admin {email} {password}
DESCRIPTION:
  create an account with the required
  access permissions to use the server
  email and password are required
EXAMPLE:
  ./bin/admin hi@static.land oooohsecretpasswordoooh
`)
}
