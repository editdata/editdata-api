var http = require('http')
var level = require('level-party')
var corsify = require('corsify')

var config = require('./config')
config.db = config.db || level(config.dbpath)
var db = config.db

var app = require('./index')(db, config)

var cors = corsify({
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': config.clientHost,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
})

http.createServer(cors(app)).listen(config.port, function () {
  app.log.info(`server started at ${config.host}:${config.port}`)
})
