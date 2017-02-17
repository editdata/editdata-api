var elasticsearch = require('elasticsearch')

module.exports = function (options) {
  options = options || {}
  var es = new elasticsearch.Client()
  var index = options.index || 'csvapi'
  var type = options.type || 'datasets'

  function esquery (query, callback) {
    es.search({
      index: index,
      type: type,
      q: query
    }, callback)
  }

  return esquery
}
