var vows = require('vows')
    ,expect = require('chai').expect

var Billing = require('../src/billing-processor')
var Classifier = require('../src/classifier')

vows.describe('Billing').addBatch({
    'creating a Billing Processor': {
        topic: function() { return new Billing() }
        ,'returns an object': {
            topic: function(processor) { return processor }
            ,'that accepts a classifier on init()': function(processor) {
                var dummy = undefined //TODO: create a dummy classifier

                expect(processor).to.respondTo('init')
                //expect(dummy).to.be.an.instanceOf(Classifier)

                //processor.init(dummy)
            }
            ,'that responds to calculate()': function(processor) {
                expect(processor).to.respondTo('calculate')
            },'that responds to calculateDuration() [static method]': function(processor) {
                expect(Billing).itself.to.respondTo('calculateDuration')
                expect(processor).to.not.respondTo('calculateDuration')
            }
        }
    }
}).addBatch({
    'when a 57 seconds call ends and': {
        topic: function() { return {
                                      "event":"call_finished",
                                      "type":"in",
                                      "duration":"57",
                                      "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                                      "talkdesk_phone_number":"+14845348611",
                                      "customer_phone_number":"+351961918192",
                                      "forwarded_phone_number":null,
                                      "timestamp":"2012-09-28T16:09:07Z"
                                    }
        }
        ,'it was answered in the browser': {
            topic: function(record) { return new BillingProcessor() }
            ,'by': {
                'a normal talkdesk number': {
                    topic: function(record) { 
                        record.talkdesk_phone_number = '+351933113200'
                        return record                  
                    }
                    ,'the bill should be 0.07 cents': function(processor, record) {
                        var bill = processor.calculate(record)

                        expect(bill).to.equal(1 *
                                                (BillingProcessor.NORMAL_NUMBER_COST        /*Normal*/ 
                                                + BillingProcessor.BROWSER_ANSWER_COST      /*Browser*/ 
                                                + BillingProcessor.PROFIT_MARGIN)           /*Minutes*/)
                    }
                }
                ,'a UK toll free talkdesk number': {
                    topic: function(record) { 
                        record.talkdesk_phone_number = '+440800'
                        return record                  
                    }
                    ,'the bill should be 0.12 cents': function(processor, record) {
                        var bill = processor.calculate(record)

                        expect(bill).to.equal(1 *
                                                (BillingProcessor.UK_TOLL_FREE_NUMBER_COST  /*Normal*/ 
                                                + BillingProcessor.BROWSER_ANSWER_COST      /*Browser*/ 
                                                + BillingProcessor.PROFIT_MARGIN)           /*Minutes*/)
                    }
                },'a US toll free talkdesk number': {
                    topic: function(record) { 
                        record.talkdesk_phone_number = '+1800'
                        return record                  
                    }
                    ,'the bill should be 0.09 cents': function(processor, record) {
                        var bill = processor.calculate(record)

                        expect(bill).to.equal(1 *
                                                (BillingProcessor.US_TOLL_FREE_NUMBER_COST  /*US TOll*/ 
                                                + BillingProcessor.BROWSER_ANSWER_COST      /*Browser*/ 
                                                + BillingProcessor.PROFIT_MARGIN)           /*Minutes*/)
                    }
                }
            }
            
        }
        ,'it was forwarded to a Malawi number': {
            topic: function(record) { 
                record.forwarded_phone_number = '+26581232'
                return record 
            }
            ,'the bill should be 0.303 cents': function(processor, record) {
                var bill = processor.calculate(record)

                expect(bill).to.equal(1 *
                                        (BillingProcessor.NORMAL_NUMBER_COST  /*US TOll*/ 
                                        + 0.243                               /*Malawi*/ 
                                        + BillingProcessor.PROFIT_MARGIN)     /*Minutes*/)
            }
        }
    }
}).addBatch({
    'a call of 42 seconds': {
        topic: function() { return Billing.calculateDuration(42) }
        ,'is seen as a one minute call': function(duration) {
            expect(duration).to.equal(1)
        }
    }
    ,'a call of 185 seconds': {
        topic: function() { return Billing.calculateDuration(185) }
        ,'is seen as a four minutes call': function(duration) {
            expect(duration).to.equal(4)
        }
    }
}).export(module)