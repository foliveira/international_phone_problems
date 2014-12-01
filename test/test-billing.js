var vows = require('vows')
    ,expect = require('chai').expect
    ,events = require('events')

{
    var log = require('npmlog')
    log.level = 'error'
}

var Billing = require('../src/billing-processor')
var DataLoader = require('../src/data-loader')

vows.describe('Billing').addBatch({
    'creating a Billing Processor': {
        topic: function() { return new Billing() }
        ,'returns an object': {
            'that responds to calculate()': function(processor) {
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
        topic: function() { 
            var promise = new events.EventEmitter()
            var dl = new DataLoader()
            var b = new Billing()

            dl.on('ready', function() {
                b.init(dl.createClassifier())
                promise.emit('success', b)
            })

            dl.init('Malawi,0.243,265 2653 2654 2655 2658 2659,')
            
            return promise
        }
        ,'for when a 57 seconds call ends': {
            'that was answered in the browser by': {
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
                        expect(bill).to.equal(1 * (0.01 + 0.01 + 0.05))
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
                        expect(bill).to.equal(1 * (0.06 + 0.01 + 0.05))
                    }
                }
                ,'a US toll free talkdesk number': {
                    topic: function(billing) { 
                        var record =  {
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
                        expect(bill).to.equal(1 * (0.03 + 0.01 + 0.05))
                    }
                }                
            }
            ,'that was forwarded': {
                'to a Malawi number': {
                    topic: function(billing) { 
                        var record =  {
                            "event":"call_finished",
                            "type":"in",
                            "duration":"57",
                            "call_id":"9d036a18-0986-11e2-b2c6-3d435d81b7fd",
                            "talkdesk_phone_number":"+15550609",
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
                        expect(bill).to.equal(1 * (0.01 + 0.243 + 0.05))
                    }
                }
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