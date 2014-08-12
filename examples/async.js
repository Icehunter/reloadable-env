'use strict';

var async = require('async');
var path = require('path');

async.series([

    function (cb) {
        console.log('Initial ENV:');
        console.log(process.env);

        function handleConfiguration(env) {
            for (var key in env) {
                process.env[key] = env[key];
            }
            console.log(process.env);
        }

        require('../lib/reloadable-env')({
            envPath: path.join(__dirname, './env.json')
        }, {
            configured: function (env) {
                console.log('Configured ENV:');
                handleConfiguration(env);
                cb();
            },
            reconfigured: function (env) {
                console.log('Reconfigured ENV:');
                handleConfiguration(env);
            },
            error: function (err) {
                console.error(err);
            }
        });

    },
    function (cb) {
        console.log('Do Some More Stuff');
        cb();
    }
], function (err) {
    if (err) {
        console.error(err.message || err);
    }
    else {
        console.log('Initalization Complete');
    }
});
