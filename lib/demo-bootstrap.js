var $ = require('jquery'),
    demoCreator = require('./demos/demoCreator'),
    demoVirtualTable = require('./demos/demoVirtualTable');


$(function () {
    demoCreator(demoVirtualTable);
});

