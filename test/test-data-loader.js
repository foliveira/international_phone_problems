var vows = require('vows')
	,expect = require('chai').expect

var DataLoader = require('../src/data-loader')
	,Classifier = require('../src/classifier')

vows.describe('DataLoader').addBatch({
    'when creating a DataLoader': {
        topic: function() { return new DataLoader() }

        ,'it should be able to be inited and create classifiers': function (loader) {
        	expect(loader).to.respondTo('init')
        	expect(loader).to.respondTo('createClassifier')
        }
        ,'init() expect a csv value': function(loader) {
        	var initWithCSV = function() { loader.init('foo,bar,baz') }
        	var initWithoutCSV = function() { loader.init() }

        	expect(initWithCSV).to.not.throw(Error)
        	expect(initWithoutCSV).to.throw(Error)
        }
        ,'a classifier should be created': function() {
        	var classifier = loader.createClassifier()

        	expect(classifier).to.be.an.instanceOf(Classifier)
        	expect(classifier).to.respondTo('classify')
        	
        }
    }
}).export(module)