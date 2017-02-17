var send = require('appa/send')
var error = require('appa/error')
var log = require('appa/log')()
var JSONStream = require('JSONStream')

module.exports = function (db, config) {
  var township = config.township
  var accounts = township.accounts
  var hooks = config.hooks
  var scopes = config.scopes.datasets

  var datasets = require('../lib/datasets')(db, config)

  return {
    list: list,
    create: create,
    read: read,
    update: update,
    destroy: destroy,
    addRow: addRow
  }

  function list (req, res, ctx) {
    township.verify(req, function (err, account, token) {
      if (err) return error(403, 'Authorization failed').pipe(res)
      if (!account) return error(403, 'Authorization failed').pipe(res)

      accounts.authorize(account.auth.key, scopes.read, function (err) {
        if (err) return error(403, 'Server requires API access scope').pipe(res)
        var owner = ctx.query.owner

        if (account.auth.key !== owner) {
          return error(403, 'access denied').pipe(res)
        }

        if (owner) {
          return datasets.find('owners', owner)
            .pipe(JSONStream.stringify())
            .pipe(res)
        } else {
          return datasets.createReadStream({ keys: false })
            .pipe(JSONStream.stringify()).pipe(res)
        }
      })
    })
  }

  function create (req, res, ctx) {
    township.verify(req, function (err, account, token) {
      if (err) return error(403, 'Authorization failed').pipe(res)
      if (!account) return error(403, 'Authorization failed').pipe(res)
      accounts.authorize(account.auth.key, scopes.write, function (err) {
        if (err) return error(403, 'Server requires API access scope').pipe(res)
        ctx.body.owners = [account.auth.key]
        datasets.create(ctx.body, function (err, obj) {
          if (err) { /* ignore: dataset doesn't exist yet */ }
          send(obj).pipe(res)
        })
      })
    })
  }

  function read (req, res, ctx) {
    township.verify(req, function (err, account, token) {
      if (err) return error(403, 'Authorization failed').pipe(res)
      if (!account) return error(403, 'Authorization failed').pipe(res)

      accounts.authorize(account.auth.key, scopes.read, function (err) {
        if (err) return error(403, 'Server requires API access scope').pipe(res)
        var key = ctx.params.dataset

        datasets.get(key, function (err, obj) {
          if (err) return error(403, err.message).pipe(res)
          if (obj.owners.indexOf(account.auth.key) < 0) {
            return error(403, 'access denied').pipe(res)
          }
          send(obj).pipe(res)
        })
      })
    })
  }

  function update (req, res, ctx) {
    township.verify(req, function (err, account, token) {
      if (err) return error(403, 'Authorization failed').pipe(res)
      if (!account) return error(403, 'Authorization failed').pipe(res)

      accounts.authorize(account.auth.key, scopes.write, function (err) {
        if (err) return error(403, 'Server requires API access scope').pipe(res)
        var key = ctx.params.dataset

        datasets.get(key, function (err, obj) {
          if (err) return error(403, err.message).pipe(res)
          if (obj.owners.indexOf(account.auth.key) < 0) {
            return error(403, 'access denied').pipe(res)
          }

          datasets.update(ctx.body, function (err, obj) {
            if (err) return error(403, err.message).pipe(res)
            send(obj).pipe(res)
          })
        })
      })
    })
  }

  function destroy (req, res, ctx) {
    township.verify(req, function (err, account, token) {
      if (err) return error(403, 'Authorization failed').pipe(res)
      if (!account) return error(403, 'Authorization failed').pipe(res)

      accounts.authorize(account.auth.key, scopes.destroy, function (err) {
        if (err) return error(403, 'Server requires API access scope').pipe(res)
        var key = ctx.params.dataset

        datasets.get(key, function (err, obj) {
          if (err) return error(404, 'dataset not found').pipe(res)
          if (obj.owners.indexOf(account.auth.key) < 0) {
            return error(403, 'access denied').pipe(res)
          }

          datasets.delete(key, function (err) {
            if (err) return error(403, err.message).pipe(res)
            send({ message: 'dataset destroyed' }).pipe(res)
          })
        })
      })
    })
  }

  function addRow (req, res, ctx) {
    township.verify(req, function (err, account, token) {
      if (err) return error(403, 'Authorization failed').pipe(res)
      if (!account) return error(403, 'Authorization failed').pipe(res)

      accounts.authorize(account.auth.key, scopes.write, function (err) {
        if (err) return error(403, 'Server requires API access scope').pipe(res)
        var key = ctx.params.dataset

        datasets.get(key, function (err, obj) {
          if (err) return error(404, 'dataset not found').pipe(res)
          if (obj.owners.indexOf(account.auth.key) < 0) {
            return error(403, 'access denied').pipe(res)
          }

          obj.data.push(ctx.body.data)
          datasets.update(obj, function (err, obj) {
            if (err) return error(403, err.message).pipe(res)
            send(obj).pipe(res)
          })
        })
      })
    })
  }
}
