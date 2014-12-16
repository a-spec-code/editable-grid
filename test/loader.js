var fs = require('fs'),
    jsdom = require('jsdom'),
    haml = require('haml');

/* Create the dom */
global.document = global.document || jsdom.jsdom();
global.window = global.window || global.document.createWindow();

require('jquery');

/* Compile haml extensions on the fly */
require.extensions['.haml'] = function (module, filename) {
    var contents = fs.readFileSync(filename).toString();
    var compiled = 'module.exports = ' + haml(contents).toString();
    return module._compile(compiled);
};
