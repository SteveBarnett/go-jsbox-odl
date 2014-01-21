var Q = require('q');

var assert = require("assert");
var utils = require("../../lib/utils");

describe("utils", function() {
    describe("maybe_call", function() {
        it("should handle functions", function() {
            function f(b, c) {
                return this.a + b + c;
            }

            assert.equal(
                utils.maybe_call(f, {a: 'foo'}, ['bar', 'baz']),
                'foobarbaz');
        });

        it("should handle non-functions", function() {
            assert.equal(utils.maybe_call('foo'), 'foo');
        });
    });

    describe("set_defaults", function() {
        it("should set defaults on the object", function() {
            var obj = {
                a: 'foo',
                c: null,
                d: false,
                e: undefined
            };

            assert.equal(obj, utils.set_defaults(obj, {
                a: 'bar',
                b: 'baz',
                c: 'qux',
                d: 'quux',
                e: 'corge'
            }));

           assert.deepEqual(obj, {
               a: 'foo',
               b: 'baz',
               c: null,
               d: false,
               e: 'corge'
           });
        });

        it("should not set defaults that are undefined", function() {
            var obj = {};
            utils.set_defaults(obj, {foo: obj.foo});
            assert.deepEqual(obj, {});
        });
    });

    describe("update", function() {
        it("should update the destination with the source", function() {
            var obj = {
                a: 'foo',
                b: 'bar',
                c: 'baz'
            };

            assert.equal(obj, utils.update(obj, {
                a: 'lerp',
                c: null
            }));

           assert.deepEqual(obj, {
                a: 'lerp',
                b: 'bar',
                c: null
           });
        });

        it("should ignore the source's prototype properties", function() {
            var dest = {
                a: 'foo',
                b: 'bar',
                c: 'baz'
            };

            var src = Object.create({
                a: 'lerp',
                b: 'larp'
            });

            src.c = 'lorem';

            utils.update(dest, src);
            assert.deepEqual(dest, {
                a: 'foo',
                b: 'bar',
                c: 'lorem'
            });
        });
    });

    describe(".inherit", function() {
        it("should set up the child's prototype chain", function() {
            var Parent = function() {};
            var Child = utils.inherit(Parent, function() {});

            var c = new Child();
            assert(c instanceof Parent);
            assert(c instanceof Child);
        });

        it("should set the parent's static methods on the child",
        function() {
            var Parent = function() {};
            Parent.foo = 'bar';

            var Child = utils.inherit(Parent, function() {});
            assert.equal(Child.extend, Parent.extend);
            assert.equal(Child.foo, Parent.foo);
        });
    });

    describe("Extendable", function() {
        var Extendable = utils.Extendable;

        describe(".extend", function() {
            it("should set up the child's prototype chain", function() {
                var Parent = Extendable.extend(function() {});
                var Child = Parent.extend(function() {});

                var p = new Parent();
                var c = new Child();

                assert(p instanceof Extendable);
                assert(p instanceof Parent);

                assert(c instanceof Extendable);
                assert(c instanceof Parent);
                assert(c instanceof Child);
            });

            it("should set the parent's static methods on the child",
            function() {
                var Parent = Extendable.extend(function() {});
                assert.equal(Parent.extend, Extendable.extend);
                Parent.foo = 'bar';

                var Child = Parent.extend(function() {});
                assert.equal(Child.extend, Parent.extend);
                assert.equal(Child.foo, Parent.foo);
            });
        });
    });

    describe("BaseError", function() {
        var BaseError = utils.BaseError;

        describe(".suberror", function() {
            it("should set up the prototype chain correctly", function() {
                var ParentError = BaseError.suberror('parent');
                var ChildError = ParentError.suberror('child');

                var p = new ParentError();
                assert(p instanceof Error);
                assert(p instanceof ParentError);

                var c = new ChildError();
                assert(c instanceof Error);
                assert(c instanceof ParentError);
                assert(c instanceof ChildError);
            });

            describe("the returned constructor function", function() {
                it("have its error name set", function() {
                    var TestError = BaseError.suberror('test');
                    var e = new TestError();
                    assert.equal(e.name, 'test');
                });

                it("should allow a default error message", function() {
                    var TestError = BaseError.suberror('test', ':(');
                    var e = new TestError();
                    assert.equal(e.message, ':(');
                });

                it("should set the instance's error message", function() {
                    var TestError = BaseError.suberror('test', ':(');
                    var e = new TestError('aah');
                    assert.equal(e.message, 'aah');
                });
            });
        });
    });
});
