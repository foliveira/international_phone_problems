'use strict'
/** 
 *
 * @module call-classifier
 */

var log = require('npmlog')

/** 
 * @constructor
 */
function Classifier(tree) {
	this.prices_tree = tree
}

/**
 * @param {string} telephone_num 
 */
Classifier.prototype.classify = function classify(telephone_num) {
	var self = this
	
	var process_number = function process(num, h) {
		var first_num = num.charAt(0)
		var following_nums = num.slice(1)
		var first_num_hash_hit = h[first_num]
		var following_nums_lookahead = following_nums.charAt(0)

		if(!first_num_hash_hit || !first_num_hash_hit.hasOwnProperty(following_nums_lookahead)) 
			return null

		if(following_nums.length === 0) 
			return first_num_hash_hit.v

		if(h.hasOwnProperty(first_num)) 
			return process(following_nums, first_num_hash_hit) || first_num_hash_hit[following_nums_lookahead].v
	}

	var first_char = telephone_num.charAt(0)

	if(first_char === '0' || first_char === '+')
		return self.classify(telephone_num.slice(1))

	return process_number(telephone_num, self.prices_tree)
}

module.exports = Classifier