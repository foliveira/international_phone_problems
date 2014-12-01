'use strict'
/** 
 * This module classifies numbers by country. This is done by tranversing
 * an index-tree.
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
 * The method classifies a given number by outputing it's price.
 * The algorithm iterates the index tree by getting each of the number
 *		digits and using them on a top-down iteration until the process
 *		hits a final leaf (one that doesn't contain the next digit of the 
 *		number as a child). In the end it returns the value object of the
 *		leaf
 *
 * @param {string} telephone_num 
 */
Classifier.prototype.classify = function classify(telephone_num) {
	var self = this
	
	var process_number = function process(num, trie) {
		var first_num = num.charAt(0)
		var following_nums = num.slice(1)
		var first_num_hash_hit = trie[first_num]
		var following_nums_lookahead = following_nums.charAt(0)

		if(!first_num_hash_hit || !first_num_hash_hit.hasOwnProperty(following_nums_lookahead)) 
			return null

		if(following_nums.length === 0) 
			return first_num_hash_hit.v

		if(trie.hasOwnProperty(first_num)) 
			return process(following_nums, first_num_hash_hit) || first_num_hash_hit[following_nums_lookahead].v || trie.v
	}

	var first_char = telephone_num.charAt(0)

	if(first_char === '0' || first_char === '+')
		return self.classify(telephone_num.slice(1))

	return process_number(telephone_num, self.prices_tree)
}

module.exports = Classifier