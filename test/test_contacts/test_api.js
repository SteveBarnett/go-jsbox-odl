var assert = require("assert");

var vumigo = require("../../lib");
var api = vumigo.contacts.api;
var Contact = api.Contact;
var ContactError = api.ContactError;


describe("contact.api", function() {
    describe("Contact", function() {
        describe(".do.validate", function() {
            it("should throw an error for non-string msisdns", function() {
                var contact = new Contact({
                    key: '123',
                    msisdn: '+27123',
                    user_account: 'user1'
                });

                contact.msisdn = null;

                assert.throws(
                    function() { contact.do.validate(); },
                    function(error) {
                        assert(error instanceof ContactError);
                        assert.equal(
                            error.message,
                            ["Contact has an msisdn of type 'object' instead of",
                             "'string': null"].join(' '));

                        return true;
                    });
            });

            it("should throw an error for non-string groups", function() {
                var contact = new Contact({
                    key: '123',
                    msisdn: '+27123',
                    user_account: 'user1',
                });

                contact.groups.push(null);

                assert.throws(
                    function() { contact.do.validate(); },
                    function(error) {
                        assert(error instanceof ContactError);
                        assert.equal(
                            error.message,
                            ["Contact has a group of type 'object' instead of",
                             "'string': null"].join(' '));

                        return true;
                    });
            });

            it("should throw an error for non-string extra values", function() {
                var contact = new Contact({
                    key: '123',
                    msisdn: '+27123',
                    user_account: 'user1',
                });

                contact.extra.spam = null;

                assert.throws(
                    function() { contact.do.validate(); },
                    function(error) {
                        assert(error instanceof ContactError);
                        assert.equal(
                            error.message,
                            ["Contact extra 'spam' has a value of type 'object'",
                             "instead of 'string': null"].join(' '));

                        return true;
                    });
            });

            it("should throw an error for non-string subscription values",
            function() {
                var contact = new Contact({
                    key: '123',
                    msisdn: '+27123',
                    user_account: 'user1',
                });

                contact.subscriptions.conv3 = null;

                assert.throws(
                    function() { contact.do.validate(); },
                    function(error) {
                        assert(error instanceof ContactError);
                        assert.equal(
                            error.message,
                            ["Contact subscription 'conv3' has a value of type",
                             "'object' instead of 'string': null"].join(' '));

                        return true;
                    });
            });
        });
    });
});
