'use strict';

var SetupModule = function setupModule(options, eventHandlers) {
    if (!(this instanceof SetupModule)) {
        return new SetupModule(options, eventHandlers);
    }
    options = options || {};

    var _initialize = true;
    var _this = this;

    var fs = require('fs');

    if (eventHandlers) {
        for (var key in eventHandlers) {
            _this.on(key, eventHandlers[key]);
        }
    }

    function emit(event, data) {
        if (_this._events && _this._events[event]) {
            _this.emit(event, data);
        }
        else if ('error' === event) {
            console.error(data);
        }
    }

    function updateENV() {
        var filePath = options.envPath;
        fs.unwatchFile(filePath);
        readENV(filePath, function (err, config) {
            if (err) {
                emit('error', err);
            }
            else {
                emit(_this.initialized ? 'reconfigured' : 'configured', config);
                _this.initialized = true;
                fs.watchFile(filePath, function (current, previous) {
                    var updated = (current.mtime > previous.mtime);
                    if (updated) {
                        updateENV();
                    }
                });
            }
        });
    }

    function readENV(filePath, callback) {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                callback(err);
            }
            else {
                var result;
                try {
                    result = JSON.parse(data.toString('utf-8'));
                }
                catch (err) {}
                callback(null, result || {});
            }
        });
    }

    var Destroy = function destroy() {
        var filePath = options.envPath;
        fs.unwatchFile(filePath);
    };

    var InitializeModule = function initializeModule() {
        if (!(this instanceof InitializeModule)) {
            return new InitializeModule();
        }
        if (options.envPath) {
            _this.destroy = Destroy;
            updateENV();
        }
        else {
            throw new Error('Invalid Configuration Path');
        }
        return _this;
    };

    if (options.mocking) {
        _initialize = false;
        _this.initializeModule = InitializeModule;
    }
    if (_initialize) {
        return new InitializeModule();
    }
    return _this;
};

module.exports = SetupModule;

require('util').inherits(module.exports, require('events').EventEmitter);
