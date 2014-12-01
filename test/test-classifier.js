var vows = require('vows')
	,expect = require('chai').expect

{
    var log = require('npmlog')
    log.level = 'error'
}

var Classifier = require('../src/classifier')
var DataLoader = require('../src/data-loader')

vows.describe('Classifier').addBatch({
    'creating a Classifier': {
        topic: function() { return new Classifier() }
        ,'returns an object': {
            topic: function(processor) { return processor }
            ,'that responds to classify()': function(processor) {
                expect(processor).to.respondTo('classify')
            }
        }
    }
}).export(module)