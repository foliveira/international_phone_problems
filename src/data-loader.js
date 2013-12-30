'use strict'

var csv = require('csv')
	,fs = require('fs')
	,events = require('events')
	,util = require('util')

function DataLoader() {
	events.EventEmitter.call(this)

}

util.inherits(DataLoader, events.EventEmitter)

DataLoader.prototype.init = function() {
	var args = Array.prototype.slice.call(arguments)

	if(args.length === 0) {
		throw new Error('Insufficient number of arguments provided')
	}

	var csv = args[0]
	if(undefined === typeof csv) { throw new Error('No valid CSV value') }

	if(lstatSync(csv).isFile() === true) {

	}
}

DataLoader.prototype.createClassifier = function() {

}

module.exports = DataLoader