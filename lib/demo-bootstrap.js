var $ = require('jquery'),
    datepicker = require('booty-datepicker'),
    demoCreator = require('./demos/demoCreator'),
    demoAddRow = require('./demos/demoAddRow'),
    demoAddRowAdvanced = require('./demos/demoAddRowAdvanced'),
    demoBasicTableRender = require('./demos/demoBasicTableRender'),
    demoCellFormatting = require('./demos/demoCellFormatting'),
    demoColumnSorting = require('./demos/demoColumnSorting'),
    demoEditableCells = require('./demos/demoEditableCells'),
    demoFixedHeightTableRender = require('./demos/demoFixedHeightTableRender'),
    demoLinks = require('./demos/demoLinks'),
    demoRowDeletion = require('./demos/demoRowDeletion'),
    demoRowSelection = require('./demos/demoRowSelection'),
    demoTotalRow = require('./demos/demoTotalRow'),
    demoCheckboxColumn = require('./demos/demoCheckboxColumn'),
    demoVersion2 = require('./demos/demoVersion2');


$(function () {

    datepicker();

//    demoCreator(demoBasicTableRender);
//    demoCreator(demoCellFormatting);
//    demoCreator(demoLinks);
//    demoCreator(demoColumnSorting);
//    demoCreator(demoTotalRow);
//    demoCreator(demoRowSelection);
//    demoCreator(demoFixedHeightTableRender);
//    demoCreator(demoAddRow);
//    demoCreator(demoAddRowAdvanced);
//    demoCreator(demoEditableCells);
//    demoCreator(demoRowDeletion);
//    demoCreator(demoCheckboxColumn);


    demoCreator(demoVersion2);
});

