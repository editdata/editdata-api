var createModel = require('level-model')
var xtend = require('xtend')

var esindex = require('./elasticsearch-index')()
var esquery = require('./elasticsearch-query')()

module.exports = function createDatasets (db, options) {
  options = xtend({
    modelName: 'Dataset',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      source: { type: 'string' },
      website: { type: 'string' },
      owners: { type: 'array' },
      data: { type: 'array' }
    },
    indexKeys: ['title', 'owners'],
    required: ['data', 'title', 'owners'],
    additionalProperties: false
  }, options)

  var datasets = createModel(db, options)

  datasets.on('create', function (data) {
    esindex.index(data)
  })

  datasets.on('update', function (data) {
    esindex.index(data)
  })

  datasets.on('delete', function (data) {
    esindex.delete(data)
  })

  return datasets
}
