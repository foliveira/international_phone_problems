'use strict'
/** 
 * A module that receives a CSV data-set and converts it to a 
 * index-tree
 *
 * @module data-loader
 */
var csv = require('csv')
	,fs = require('fs')
	,log = require('npmlog')
	,events = require('events')
	,util = require('util')

var Classifier = require('./classifier')

/** 
 * @constructor
 */
function DataLoader() {
	var self = this
	events.EventEmitter.call(this) //Call the super() constructor

	/** The index-tree structure */
	this.trie = {}

	/**
	 * A recursive function that creates a prefix entry on the tree.
	 * This entry is an object that is created for each of the number
	 * digits and in the last object, corresponding to the last digit
	 * of the prefix, there's a value object with the value and country
	 */
	var processPrefixs = function procPrfxs(prefix, value, tree) {
		if(tree === undefined)
			tree = self.trie

		if(prefix.length === 0) 
			return tree.v = value

		var first_num = prefix.charAt(0)
		var rest_of_prefix = prefix.slice(1)

		if(!tree.hasOwnProperty(first_num)) {
			tree[first_num] = {}
		}

		return procPrfxs(rest_of_prefix, value, tree[first_num])
	}

	/**
	 * Receives an array of values and processes them into a tree
	 * of objects containing the country name and price.
	 * Ignores the header row.
	 */
	this.processData = function(values) {
		for (var i = values.length - 1; i >= 0; i--) {
			var data = values[i]

			var country = data[0]
			var price = parseFloat(data[1])
			var prefixs = data[2].split(' ')

			if(country === 'Name') continue //Ignore the CSV header

			var value_to_insert = { c: country, p: price}

			for (var j = prefixs.length - 1; j >= 0; j--) {
				processPrefixs(prefixs[j], value_to_insert)
			}
		}

		self.emit('ready')
	}
}

util.inherits(DataLoader, events.EventEmitter)

/**
 * Receives either an array, string or ReadStream containing
 * a list of CSV values, converts them to an array and feeds them
 * to a processor 
 *
 * @param {Array|String|ReadStream} data_value A set of CSV data to be loaded
 *
 */
DataLoader.prototype.init = function() {
	var self = this
	var args = Array.prototype.slice.call(arguments)

	if(args.length === 0) {
		throw new Error('Insufficient number of arguments provided')
	}

	var data_value = args[0]
	if(undefined === typeof data_value) { 
		throw new Error('No valid CSV value') 
	}

	try {
		var raw_data = undefined

		log.info('DataLoader', 'Checking for the type of data')

		if(data_value.constructor === Array) {
			log.info('DataLoader', 'Got an array of values')
			raw_data = csv().from.array(data_value)
							.to.array(self.processData)
		
		} else if(data_value.constructor === fs.ReadStream) {
			log.info('DataLoader', 'Got a file')
			raw_data = csv().from.stream(data_value)
							.to.array(self.processData)
		
		} else if(data_value.constructor === String) {
			log.info('DataLoader', 'Got a string with comma separated values')
			raw_data = csv().from.string(data_value)
							.to.array(self.processData)
		
		} else {
			throw new Error('The type of data provided is not valid')
		}
	} 
	catch (e)
	{
		log.error('DataLoader', e)
	}
}

/**
 *	Creates a classifier that can be used to calculate the cost of a call
 * 	based on the price of each number. The prices are the ones loaded when
 *	init() was called
 *
 *	@returns {Classifier} a classifier based on the loaded data
 */
DataLoader.prototype.createClassifier = function() {
	return new Classifier(this.trie)
}

module.exports = DataLoader