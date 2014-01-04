'use strict'
/** 
 * This module processes the bill for a given call based on the numbers
 * of it's participants
 *
 * @module billing-processor 
 */

var log = require('npmlog')

/** 
 * @constructor
 */
function BillingProcessor() {
	/** The defined profit margin is 5 cents */
	this.PROFIT_MARGIN = 0.05
	/** The cost for a regular number is 1 cent */
	this.NORMAL_NUMBER_COST = 0.01
	/** For a US toll free number the cost is 3 cents */
	this.US_TOLL_FREE_NUMBER_COST = 0.03
	/** For a UK toll free number the cost is 6 cents */
	this.UK_TOLL_FREE_NUMBER_COST = 0.06
	/** If a call is answered in the browser it has a 1 cent cost */
	this.BROWSER_ANSWER_COST = 0.01 

	/** */
	this.classifier = undefined
}

/**
 * @param {Classifier} classifier 
 */
BillingProcessor.prototype.init = function(classifier) {
	this.classifier = classifier
}

/**
 *	Calculates the price of a call based on the location of each of it's participants,
 *	while following the formula: `Talkdesk_Number_Cost + External_Number_Cost + Profit_Margin`
 *
 *	@param {string} talkdesk_num the talkdesk number for which the call was made
 *	@param {string} external_num the number that is calling 
 *	@param {string} [fwd_num] a number to where the call was forwarded
 *
 *	@returns {Number} the total price for the call
 */
BillingProcessor.prototype.calculate = function(talkdesk_num, external_num, fwd_num) {
	var self = this
	var calculateTalkdeskCost = function(number) {
		if(number.substring(0, 5) === '+1888') return self.US_TOLL_FREE_NUMBER_COST
		else if (number.substring(0, 6) === '+44800') return self.UK_TOLL_FREE_NUMBER_COST

		return self.NORMAL_NUMBER_COST
	}
	
	var talkdesk_num_cost = calculateTalkdeskCost(talkdesk_num)
	var answering_cost = (fwd_num === undefined) ? this.BROWSER_ANSWER_COST : classifier.classify(fwd_num)

	return this.PROFIT_MARGIN + talkdesk_num_cost + answering_cost
}

/**
 * Calculate the duration in minutes of a call given it's duration in seconds
 *
 *	@param {Number} duration_secs The call duration in seconds
 *
 *	@return {Number} the call duration in minutes (always rounded to the next minute)
 */
BillingProcessor.calculateDuration = function(duration_secs) {
	return Math.ceil(duration_secs / 60)
}

module.exports = BillingProcessor