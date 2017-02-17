var es = require('elasticsearch')

module.exports = ElasticSearchIndex

function ElasticSearchIndex (options) {
  if (!(this instanceof ElasticSearchIndex)) return new ElasticSearchIndex(options)
  options = options || {}

  this.es = new es.Client({
    host: options.host || 'localhost:9200',
    log: options.log || 'trace'
  })

  this._index = options.index || 'csvapi',
  this._type = options.type || 'wat'
}

ElasticSearchIndex.prototype.index = function (key, data, callback) {
  var self = this

  if (typeof key === 'object') {
    callback = data
    data = key
    key = data.key
  }

  callback = callback || function () {}

  var options = {
    index: self._index,
    type: self._type,
    id: key,
    body: data,
    refresh: true
  }

  this.es.index(options, callback)
}

ElasticSearchIndex.prototype.create = function (key, data, callback) {
  this.index(key, data, callback)
}

ElasticSearchIndex.prototype.update = function (key, data, callback) {
  this.index(key, data, callback)
}

ElasticSearchIndex.prototype.delete = function (key, callback) {
  if (typeof key === 'object') key = key.key

  var options = {
    index: this._index,
    type: this._type,
    id: key,
    refresh: true
  }

  this.es.delete(options, callback)
}

ElasticSearchIndex.prototype.close = function () {
  this.es.close()
}
