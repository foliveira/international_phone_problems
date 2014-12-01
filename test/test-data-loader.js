var vows = require('vows')
	,expect = require('chai').expect

{
    var log = require('npmlog')
    log.level = 'error'
}

var DataLoader = require('../src/data-loader')
	,Classifier = require('../src/classifier')


vows.describe('DataLoader').addBatch({
    'creating a DataLoader': {
        topic: function() { return new DataLoader() }
        ,'returns an object': {
        	topic: function(loader) { return loader }
        	,'which responds to init': function(loader) {
        		expect(loader).to.respondTo('init')
        	}
        	,'which can create classifiers': function(loader) {
        		expect(loader).to.respondTo('createClassifier')
        	}
        	,'where calling init()': {
        		topic: function(loader) { return loader }
        		,'expects a CSV value': function(loader) {
	        		var initWithCSV = function() { loader.init('foo,bar,baz') }
	        		var initWithoutCSV = function() { loader.init() }
	        		var otherInitWithoutCSV = function() { loader.init() }

	        		expect(initWithCSV).to.not.throw(Error)
	        		expect(initWithoutCSV).to.throw(Error)
	        		expect(initWithoutCSV).to.throw(Error)
        		}
        		,'makes createClassifier()': {
        			topic: function(loader) { return loader.createClassifier() }
        			,'return a valid classifier': function(classifier) {
	        			expect(classifier).to.be.an.instanceOf(Classifier)
			        	expect(classifier).to.respondTo('classify')	
        			}
        		}
			}
		}
    }
}).export(module)