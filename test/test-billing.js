var vows = require('vows')
    ,expect = require('chai').expect

var Billing = require('../src/billing-processor')
var Classifier = require('../src/classifier')

var processor = new Billing()

vows.describe('Billing').addBatch({
    'creating a Billing Processor': {
        topic: function() { return new Billing() }
        ,'returns an object': {
            topic: function(processor) { return processor }
            ,'that responds to calculate()': function(processor) {
                expect(processor).to.respondTo('calculate')
            }
            ,'that responds to calculateDuration() [static method]': function(processor) {
                expect(Billing).itself.to.respondTo('calculateDuration')
                expect(processor).to.not.respondTo('calculateDuration')
            }
        }
    }
}).addBatch({
    'a bill': {
        topic: function() { return new Billing() }
        ,'for when a 57 seconds call ends and': {
            'is answered in the browser by': {
                'a normal talkdesk number': {
                    topic: function(billing) {
                        var record =  {
                            "event":"call_finished",
                            "type":"in",
                            "duration":"57",
                            "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                            "talkdesk_phone_number":"+351933113200",
                            "customer_phone_number":"+351961918192",
                            "forwarded_phone_number":null,
                            "timestamp":"2012-09-28T16:09:07Z"
                        }    

                        return Billing.calculateDuration(record.duration)
                                * billing.calculate(record.talkdesk_phone_number
                                                ,record.customer_phone_number
                                                ,record.forwarded_phone_number)        
                    }
                    ,'should be 0.07 cents': function(bill) {
                        expect(bill).to.equal(1 *
                                                (processor.NORMAL_NUMBER_COST
                                                + processor.BROWSER_ANSWER_COST 
                                                + processor.PROFIT_MARGIN))
                    }
                }
                ,'a UK toll free talkdesk number': {
                    topic: function(billing) { 
                        var record = {
                            "event":"call_finished",
                            "type":"in",
                            "duration":"57",
                            "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                            "talkdesk_phone_number":"+4480009601109",
                            "customer_phone_number":"+351961918192",
                            "forwarded_phone_number":null,
                            "timestamp":"2012-09-28T16:09:07Z"
                        }

                        return Billing.calculateDuration(record.duration)
                                * billing.calculate(record.talkdesk_phone_number
                                                    ,record.customer_phone_number
                                                    ,record.forwarded_phone_number)  
                    }
                    ,'should be 0.12 cents': function(bill) {
                        console.dir(bill)
                        expect(bill).to.equal(1 *
                                                (processor.UK_TOLL_FREE_NUMBER_COST 
                                                + processor.BROWSER_ANSWER_COST
                                                + processor.PROFIT_MARGIN))
                    }
                    }
                }
                ,'a US toll free talkdesk number': {
                    topic: function(record) { 
                        return {
                            "event":"call_finished",
                            "type":"in",
                            "duration":"57",
                            "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                            "talkdesk_phone_number":"+18885550609",
                            "customer_phone_number":"+351961918192",
                            "forwarded_phone_number":null,
                            "timestamp":"2012-09-28T16:09:07Z"
                        }

                        return Billing.calculateDuration(record.duration)
                                * billing.calculate(record.talkdesk_phone_number
                                                    ,record.customer_phone_number
                                                    ,record.forwarded_phone_number)
                    }
                    ,'should be 0.09 cents': function(bill) {
                        expect(bill).to.equal(1 *
                                                (processor.US_TOLL_FREE_NUMBER_COST 
                                                + processor.BROWSER_ANSWER_COST 
                                                + processor.PROFIT_MARGIN))
                    }
                }                
            }
        }
        ,'it was forwarded': {
            'to a Malawi number': {
                topic: function(record) { 
                    return {
                        "event":"call_finished",
                        "type":"in",
                        "duration":"57",
                        "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                        "talkdesk_phone_number":"+18885550609",
                        "customer_phone_number":"+351961918192",
                        "forwarded_phone_number":"+26581232",
                        "timestamp":"2012-09-28T16:09:07Z"
                    }

                    return Billing.calculateDuration(record.duration)
                            * billing.calculate(record.talkdesk_phone_number
                                                ,record.customer_phone_number
                                                ,record.forwarded_phone_number)
                }
                ,'should be 0.303 cents': function(bill) {
                    expect(bill).to.equal(1 *
                                            (processor.NORMAL_NUMBER_COST  /*Normal*/ 
                                            + 0.243                      /*Malawi*/ 
                                            + processor.PROFIT_MARGIN)     /*Minutes*/)
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