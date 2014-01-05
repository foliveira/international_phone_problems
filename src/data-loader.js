'use strict'
/** 
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
	events.EventEmitter.call(this)

	this.trie = {}

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

	this.processData = function(data) {
		var country = data[0]
		var price = parseFloat(data[1])
		var prefixs = data[2].split(' ')

		if(country === 'Name') return

		var value_to_insert = { c: country, p: price}

		for (var i = prefixs.length - 1; i >= 0; i--) {
			var pfx = prefixs[i]

			processPrefixs(pfx, value_to_insert)
		}
	}
}

util.inherits(DataLoader, events.EventEmitter)

/**
 * @param {string} csv Comma Separated Value or a path to a file
 * @param {Function} cb Callback to be executed when the CSV is processed
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
							.transform(self.processData)
							.on('end', function() { self.emit('end') })
		
		} else if(data_value.constructor === fs.ReadStream) {
			log.info('DataLoader', 'Got a file')
			raw_data = csv().from.stream(data_value)
							.transform(self.processData)
							.on('end', function() { self.emit('end') })
		
		} else if(data_value.constructor === String) {
			log.info('DataLoader', 'Got a string with comma separated values')
			raw_data = csv().from.string(data_value)
							.transform(self.processData)
							.on('end', function() { self.emit('end') })
		
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