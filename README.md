# Reloadable ENV

Ever wanted to change environment variables on the fly whenever you need?

I know I have.

### Installation:

##### Git

```
npm i git://github.com/Icehunter/reloadable-env -S
```

##### npmjs

```
npm i reloadable-env
```

##### package.json

```javascript
"dependencies": {
    "reloadable-env": "git://github.com/Icehunter/reloadable-env.git"
}
```

##### Version Specific

```javascript
"dependencies": {
    "reloadable-env": "git://github.com/Icehunter/reloadable-env.git#hash|branch"
}
```

### Usage:
This library has three events as noted below.

```javascript
'use strict';

function handleConfiguration(env) {
    for (var key in env) {
        process.env[key] = env[key];
    }
}

var reloadable = require('reloadable-env')('relative/path/to/env.json', {
    configured: function(env) {
        handleConfiguration(env);
    },
    reconfigured: function(env) {
        handleConfiguration(env);
    },
    error: function(err) {
        console.error(err);
    }
});
```

### Recommendations:
It is recommend that you use async and wait for the configuration to be loaded before continuing initialization.

ENV changes are as simple as modifying the env.json file in the repository and doing a git pull.

##### Example:
Run this with 'npm i && node example/async.js'

```javascript
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
            configPath: path.join(__dirname, './env.json')
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

```
