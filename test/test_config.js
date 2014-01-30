var assert = require("assert");

var vumigo = require("../lib");
var test_utils = vumigo.test_utils;
var SandboxConfig = vumigo.config.SandboxConfig;
var IMConfig = vumigo.config.IMConfig;


describe("SandboxConfig", function() {
    var im;
    var config;

    beforeEach(function() {
        return test_utils.make_im().then(function(new_im) {
            im = new_im;
            config = im.sandbox_config;
        });
    });

    describe(".setup", function() {
        beforeEach(function() {
            config = new SandboxConfig(im);
        });

        it("should emit a 'setup' event", function() {
            var p = config.once.resolved('setup');
            return config.setup().thenResolve(p);
        });
    });
    
    describe(".get", function() {
        it("should retrieve the config value", function() {
            return config.get('foo').then(function(value) {
                assert.deepEqual(JSON.parse(value), {bar: 'baz'});
            });
        });

        describe("if the 'json' option is true", function() {
            it("should parse the config value as JSON", function() {
                return config.get('foo', {json: true}).then(function(value) {
                    assert.deepEqual(value, {bar: 'baz'});
                });
            });
        });
    });
});


describe("IMConfig", function() {
    var im;
    var config;

    beforeEach(function() {
        return test_utils.make_im().then(function(new_im) {
            im = new_im;
            config = im.config;
        });
    });

    describe(".setup", function() {
        var config;

        beforeEach(function() {
            config = new IMConfig(im);
        });

        it("should emit a 'setup' event", function() {
            var p = config.once.resolved('setup');
            return config.setup().thenResolve(p);
        });

        it("setup the config from its value in the sandbox config",
        function() {
            return config.setup().then(function() {
                assert.equal(config.get('lerp'), 'larp');
            });
        });
    });
});