/* global describe, it, beforeEach */

'use strict';

process.env.NODE_ENV = 'test';

var fs = require('fs');
var path = require('path');

var stubs = {};
var should = require('should');

var reloadableENV = require('../lib/reloadable-env');

describe('Reloadable ENV Tests', function () {
    beforeEach(function (done) {
        for (var stub in stubs) {
            try {
                stubs[stub].restore();
            }
            catch (err) {}
        }
        done();
    });
    describe('Initializing', function () {
        describe('with no params', function () {
            it('should throw an error', function (done) {
                try {
                    reloadableENV();
                }
                catch (err) {
                    done();
                }
            });
        });
        describe('with a proper "options" and no event handlers', function () {
            it('should be successful', function (done) {
                reloadableENV({
                    envPath: path.join(process.env.PWD, './test/good.json'),
                    mocking: true
                });
                done();
            });
        });
        describe('with a proper "options" and event handlers', function () {
            describe('and the "error" event is not subscriber to', function () {
                describe('and an error occurs', function () {
                    it('should gracefully "eat" the error and pass to console', function (done) {
                        reloadableENV({
                            envPath: path.join(process.env.PWD, './test/missing.json')
                        });
                        done();
                    });
                });
            });
            describe('and the "error" event is subscribed to', function () {
                describe('and an error occurs', function () {
                    it('should fire the "error" event', function (done) {
                        reloadableENV({
                            envPath: path.join(process.env.PWD, './test/missing.json')
                        }, {
                            error: function () {
                                done();
                            }
                        });
                    });
                });
            });
        });
    });
    describe('Event Handling', function () {
        describe('[configured]', function () {
            it('should fire the "configured" event the moment it finished loaded the file on first run', function (done) {
                var reloadable = reloadableENV({
                    envPath: path.join(process.env.PWD, './test/good.json'),
                    mocking: true
                }, {
                    configured: function (env) {
                        for (var key in env) {
                            should(require(path.join(process.env.PWD, './test/good.json'))[key]).equal(env[key]);
                        }
                        reloadable.destroy();
                        done();
                    }
                });
                reloadable.initializeModule();
            });
        });
        describe('[reconfigured]', function () {
            it('should fire the "reconfigured" event within 10 seconds when the file contents change', function (done) {
                this.timeout(15000);
                var filePath = path.join(process.env.PWD, './test/reconfigured_empty.json');
                fs.writeFileSync(filePath, '');
                var reloadable = reloadableENV({
                    envPath: filePath,
                    mocking: true
                }, {
                    configured: function (env) {
                        Object.keys(env).length.should.equal(0);
                        setTimeout(function () {
                            fs.writeFileSync(filePath, JSON.stringify({
                                'NODE_TEST': 'TEST'
                            }));
                        }, 1000);
                    },
                    reconfigured: function (env) {
                        env.should.have.property('NODE_TEST');
                        env.NODE_TEST.should.equal('TEST');
                        reloadable.destroy();
                        fs.unlink(filePath);
                        done();
                    }
                });
                reloadable.initializeModule();
            });
        });
        describe('[error]', function () {
            it('should fire the "error" event if there is an error reading the file', function (done) {
                reloadableENV({
                    envPath: path.join(process.env.PWD, './test/missing.json')
                }, {
                    error: function () {
                        done();
                    }
                });
            });
        });
    });
});
