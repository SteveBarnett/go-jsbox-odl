var assert = require("assert");

var vumigo = require("../lib");
var test_utils = vumigo.test_utils;
var http_api = vumigo.http_api;
var HttpApi = http_api.HttpApi;
var JsonApi = http_api.JsonApi;
var HttpRequest = http_api.HttpRequest;
var HttpResponse = http_api.HttpResponse;
var HttpResponseError = http_api.HttpResponseError;
var HttpRequestError = http_api.HttpRequestError;


describe("HttpRequestError", function() {
    var request;

    beforeEach(function() {
        request = new HttpRequest('GET', 'http://foo.com/');
    });

    describe(".message", function() {
        it("should include the request", function() {
            var error = new HttpRequestError(request);
            assert(error.message.indexOf(request) > -1);
        });

        it("should include the error reason if available", function() {
            var error = new HttpRequestError(request, 'Sigh');
            assert(error.message.indexOf('Sigh') > -1);
        });
    });
});

describe("HttpResponseError", function() {
    var response;

    beforeEach(function() {
        var request = new HttpRequest('GET', 'http://foo.com/');
        response = new HttpResponse(request, 404);
    });

    describe(".message", function() {
        it("should include the response", function() {
            var error = new HttpResponseError(response);
            assert(error.message.indexOf(response) > -1);
        });

        it("should include the error reason if available", function() {
            var error = new HttpResponseError(response, 'Sigh');
            assert(error.message.indexOf('Sigh') > -1);
        });
    });
});

describe("HttpRequest", function() {
    describe(".encode", function() {
        it("should encode the request's body if available", function() {
            var request = new HttpRequest('GET', 'http://foo.com/', {
                data: {foo: 'bar'}
            });
            request.encode(JSON.stringify);
            assert.deepEqual(request.body, '{"foo":"bar"}');
        });
    });

    describe(".to_cmd", function() {
        it("should convert the request to a sandbox API command", function() {
            var request = new HttpRequest('GET', 'http://foo.com/');
            assert.deepEqual(request.to_cmd(), {
                name: 'http.get',
                data: {url: 'http://foo.com/'}
            });
        });

        it("should include the request headers if available", function() {
            var request = new HttpRequest('GET', 'http://foo.com/', {
                headers: {foo: ['bar']}
            });

            var cmd = request.to_cmd();
            assert.deepEqual(cmd.data.headers, {foo: ['bar']});
        });

        it("should include the url params if available", function() {
            var request = new HttpRequest('GET', 'http://foo.com/', {
                params: [{
                    name: 'bar',
                    value: 'baz'
                }]
            });

            var cmd = request.to_cmd();
            assert.equal(cmd.data.url, 'http://foo.com/?bar=baz');
        });

        it("should include the request body if available", function() {
            var request = new HttpRequest('GET', 'http://foo.com/', {
                data: {foo: 'bar'}
            });
            request.encode(JSON.stringify);

            var cmd = request.to_cmd();
            assert.equal(cmd.data.data, '{"foo":"bar"}');
        });
    });

    describe(".toString", function() {
        it("should include the request method", function() {
            var request = new HttpRequest('GET', 'http://foo.com/');
            assert(request.toString().indexOf('GET') > -1);
        });

        it("should include the url", function() {
            var request = new HttpRequest('GET', 'http://foo.com/');
            assert(request.toString().indexOf('http://foo.com/') > -1);
        });

        it("should include the body if available", function() {
            var request = new HttpRequest('GET', 'http://foo.com/', {
                data: {foo: 'bar'}
            });
            request.encode(JSON.stringify);

            assert(request.toString().indexOf('{"foo":"bar"}') > -1);
        });

        it("should include the params if available", function() {
            var request = new HttpRequest('GET', 'http://foo.com/', {
                params: [{
                    name: 'bar',
                    value: 'baz'
                }]
            });

            var request_str = request.toString();
            assert(request_str.indexOf('[{"name":"bar","value":"baz"}]') > -1);
        });
    });
});

describe("HttpResponse", function() {
    var request;

    beforeEach(function() {
        request = new HttpRequest('GET', 'http://foo.com/');
    });

    describe(".decode", function() {
        it("should decode the response's data if available", function() {
            var response = new HttpResponse(request, 404, {
                body: '{"foo":"bar"}'
            });
            response.decode(JSON.parse);
            assert.deepEqual(response.data, {foo: 'bar'});
        });
    });

    describe(".toString", function() {
        it("should include the code", function() {
            var response = new HttpResponse(request, 404);
            assert(response.toString().indexOf(404) > -1);
        });

        it("should include the body if available", function() {
            var response = new HttpResponse(request, 404, {
                body: '{"foo":"bar"}'
            });
            assert(response.toString().indexOf('{"foo":"bar"}') > -1);
        });
    });
});

describe("HttpApi", function() {
    var im;
    var api;

    function make_api(opts) {
        return test_utils.make_im().then(function(new_im) {
            im = new_im;
            api = new HttpApi(im, opts);
            return api;
        });
    }

    beforeEach(function() {
        return make_api().then(function(new_api) {
            api = new_api;
            im = api.im;
        });
    });

    describe(".get", function() {
        it("should perform GET requests", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'GET',
                    url: 'http://foo.com/',
                },
                response: {
                    body: '{"foo": "bar"}'
                }
            });

            return api.get('http://foo.com/').then(function(response) {
                assert.equal(response.code, 200);
                assert.equal(response.data, '{"foo": "bar"}');
            });
        });
    });

    describe(".head", function() {
        it("should perform HEAD requests", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'HEAD',
                    url: 'http://foo.com/',
                }
            });

            return api.head('http://foo.com/').then(function(response) {
                assert.equal(response.code, 200);
                assert.strictEqual(response.data, null);
            });
        });
    });

    describe(".post", function() {
        it("should perform POST requests", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'POST',
                    url: 'http://foo.com/',
                    content_type: 'application/json',
                    body: '{"lerp": "larp"}',
                },
                response: {
                    body: '{"foo": "bar"}'
                }
            });

            return api.post('http://foo.com/', {
                data: '{"lerp": "larp"}',
                headers: {'Content-Type': ['application/json']}
            }).then(function(response) {
                assert.equal(response.code, 200);
                assert.strictEqual(response.data, '{"foo": "bar"}');
            });
        });
    });

    describe(".put", function() {
        it("should perform PUT requests", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'PUT',
                    url: 'http://foo.com/',
                    body: '{"lerp": "larp"}',
                    content_type: 'application/json',
                },
                response: {
                    body: '{"foo": "bar"}'
                }
            });

            return api.put('http://foo.com/', {
                data: '{"lerp": "larp"}',
                headers: {'Content-Type': ['application/json']}
            }).then(function(response) {
                assert.equal(response.code, 200);
                assert.strictEqual(response.data, '{"foo": "bar"}');
            });
        });
    });

    describe(".delete", function() {
        it("should perform DELETE requests", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'DELETE',
                    url: 'http://foo.com/',
                    content_type: 'application/json',
                    body: '{"lerp": "larp"}',
                },
                response: {
                    body: '{"foo": "bar"}'
                }
            });

            return api.delete('http://foo.com/', {
                data: '{"lerp": "larp"}',
                headers: {'Content-Type': ['application/json']}
            }).then(function(response) {
                assert.equal(response.code, 200);
                assert.strictEqual(response.data, '{"foo": "bar"}');
            });
        });
    });

    describe(".request", function() {
        it("should accept responses in the 200 range", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'GET',
                    url: 'http://foo.com/'
                },
                response: {
                    code: 201,
                    body: '201 Created'
                }
            });

            return api
                .request('get', 'http://foo.com/')
                .then(function(response) {
                    assert.equal(response.code, 201);
                    assert.equal(response.data, '201 Created');
                });
        });

        it("should support request body data", function() {
            im.api.add_http_fixture({
                request: {
                    url: 'http://foo.com/',
                    method: 'POST',
                    body: 'ping'
                }
            });

            return api.request("post", 'http://foo.com/', {
                data: 'ping',
            }).then(function() {
                var request = im.api.http_requests[0];
                assert.equal(request.body, 'ping');
            });
        });

        it("should support request url params", function() {
            im.api.add_http_fixture({
                request: {
                    method: 'GET',
                    url: 'http://foo.com/?a=1&b=2',
                }
            });

            return api.get('http://foo.com/', {
                params: [{
                    name :'a',
                    value: 1
                }, {
                    name :'b',
                    value: 2
                }]
            }).then(function(data) {
                var request = im.api.http_requests[0];
                assert.equal(request.url, 'http://foo.com/?a=1&b=2');
            });
        });

        it("should support basic auth", function() {
            return make_api({
                auth: {
                    username: 'me',
                    password: 'pw'
                }
            }).then(function() {
                im.api.add_http_fixture({
                    request: {
                        method: 'GET',
                        url: 'http://foo.com/',
                    }
                });

                return api.get('http://foo.com/');
            }).then(function() {
                var request = im.api.http_requests[0];
                assert.deepEqual(
                    request.headers.Authorization,
                    ['Basic bWU6cHc=']);
            });
        });

        describe("if the response code is in the error range", function() {
            it("should throw an error", function() {
                im.api.add_http_fixture({
                    request: {
                        method: 'GET',
                        url: 'http://foo.com/'
                    },
                    response: {
                        code: 404,
                        body: '404 Not Found'
                    }
                });

                var p = api.request("get", "http://foo.com/");
                return p.catch(function(e) {
                    assert(e instanceof HttpResponseError);
                    assert.equal(e.response.code, 404);
                    assert.equal(e.response.body, '404 Not Found');
                });
            });
        });

        describe("if the body cannot be parsed", function() {
            beforeEach(function() {
                api.decode_response_body = function() {
                    throw Error("You shall not parse");
                };
            });

            it("should throw an error", function() {
                im.api.add_http_fixture({
                    request: {
                        method: 'GET',
                        url: 'http://foo.com/'
                    },
                    response: {
                        code: 200,
                        body: '{"foo": "bar"}'
                    }
                });

                var p = api.request('get', 'http://foo.com/');
                return p.catch(function(e) {
                    assert(e instanceof HttpResponseError);
                    assert.equal(e.reason, [
                        "Could not parse response",
                        "(Error: You shall not parse)"].join(' '));
                    assert.equal(e.response.code, 200);
                    assert.equal(e.response.body, '{"foo": "bar"}');
                });
            });
        });

        describe("if the sandbox api replies with a failure", function() {
            beforeEach(function() {
                im.api.request = function(cmd_name, cmd_data, reply) {
                    reply({
                        success: false,
                        reason: 'No apparent reason'
                    });
                };
            });

            it("should throw an error", function() {
                im.api.add_http_fixture({
                    request: {
                        method: 'GET',
                        url: 'http://foo.com/'
                    },
                    response: {
                        code: 200,
                        body: '{"foo": "bar"}'
                    }
                });

                var p = api.request('get', 'http://foo.com/');
                return p.catch(function(e) {
                    assert(e instanceof HttpRequestError);
                    assert.equal(e.reason, 'No apparent reason');
                    assert.equal(e.request.url, 'http://foo.com/');
                    assert.equal(e.request.method, 'GET');
                });
            });
        });
    });
});


describe("JsonApi", function() {
    var im;
    var api;

    function make_api(opts) {
        return test_utils.make_im().then(function(new_im) {
            im = new_im;
            api = new JsonApi(im, opts);
            return api;
        });
    }

    beforeEach(function() {
        return make_api();
    });

    it("should decode JSON body response", function() {
        im.api.add_http_fixture({
            request: {
                method: 'GET',
                url: 'http://foo.com/',
                content_type: 'application/json; charset=utf-8'
            },
            response: {
                body: '{"foo": "bar"}'
            }
        });

        return api.request('get', 'http://foo.com/').then(function(response) {
            assert.deepEqual(response.data, {foo: 'bar'});
        });
    });

    it("should encode request data to JSON", function() {
        im.api.add_http_fixture({
            request: {
                url: 'http://foo.com/',
                method: 'POST',
                body: '{"lerp": "larp"}',
                content_type: 'application/json; charset=utf-8'
            }
        });

        return api.request("post", 'http://foo.com/', {
            data: {lerp: 'larp'},
        }).then(function(response) {
            assert.equal(response.request.body, '{"lerp":"larp"}');
        });
    });
});
