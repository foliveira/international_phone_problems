'use strict'
/** 
 * @module data-loader
 */

var csv = require('csv')
	,fs = require('fs')
	,events = require('events')
	,util = require('util')
	,log = require('npmlog')

var Classifier = require('./classifier')

/** 
 * @constructor
 */
function DataLoader() {
	events.EventEmitter.call(this)

}

/** Extends this class with EventEmitter */
util.inherits(DataLoader, events.EventEmitter)

/**
 * @param {string} csv Comma Separated Value or a path to a file
 * @param {Function} cb Callback to be executed when the CSV is processed
 */
DataLoader.prototype.init = function() {
	var args = Array.prototype.slice.call(arguments)

	if(args.length === 0) {
		throw new Error('Insufficient number of arguments provided')
	}

	var csv = args[0]
	if(undefined === typeof csv) { throw new Error('No valid CSV value') }

	if(fs.lstatSync(csv).isFile() === true) {
		csv().from(fs.createReadStream(csv))
			.to.string(callback(data, count))
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
	return new Classifier()
}

module.exports = DataLoader