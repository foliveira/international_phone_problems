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
                expect(dummy).to.be.an.instanceOf(Classifier)

                processor.init(dummy)
            }
            ,'that responds to calculate()': function(processor) {
                expect(processor).to.respondTo('calculate')
            }
        }
    }
}).addBatch({
    'when a call ends': {
        topic: function() { return {
                                      "event":"call_finished",
                                      "type":"in",
                                      "duration":"91",
                                      "account_id":"4f4a37a201c642014200000c",
                                      "contact_id":"505de7e5f857d94a3d000001",
                                      "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                                      "talkdesk_phone_number":"+14845348611",
                                      "customer_phone_number":"+351961918192",
                                      "forwarded_phone_number":null,
                                      "agent_id":"4f78ded32b0ac00001000001",
                                      "previous_agent_id":"5054d89ec7573f082a000c9e",
                                      "customer_id":"505de7e5f857d94a3d000001",
                                      "customer":null,
                                      "record":"http://s3.amazonaws.com/plivocloud/9ff87998-0986-11e2-aed8-002590513972.mp3",
                                      "timestamp":"2012-09-28T16:09:07Z"
                                    }
        }
        ,'it was forwarded': {
            topic: function(record) { return record }
            ,'to': {
                'a normal talkdesk number': {
                    topic: function(record) { 
                        record.forwarded_phone_number = '+351933113200'
                        return record                  
                    }
                    ,'the bill should be X€': function(record) {
                        var bill = 'Y'

                        expect(bill).to.equal('X')
                    }
                }
                ,'a UK toll free talkdesk number': {
                    topic: function(record) { 
                        record.forwarded_phone_number = '+44'
                        return record                  
                    }
                    ,'the bill should be X€': function(record) {
                        var bill = 'Y'

                        expect(bill).to.equal('X')   
                    }
                },'a US toll free talkdesk number': {
                    topic: function(record) { 
                        record.forwarded_phone_number = '+1800'
                        return record                  
                    }
                    ,'the bill should be X€': function(record) {
                        var bill = 'Y'

                        expect(bill).to.equal('X')
                    }
                }
            }
            
        }
        ,'it was answered in the browser': {
            topic: function(record) { return record }
            ,'the bill should be Z€': function(record) {
                var bill = 'Y'
                expect(bill).to.equal('Z')
            }
        }
    }
}).export(module)