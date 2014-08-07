var $ = require('jquery');

var TR_HEIGHT = 30;

var PseudoScroller = function (grid, tbodyHeight) {
    this._grid = grid;
    this._tbodyHeight = tbodyHeight;
    this._scrollbar = grid.els.scrollbarY;

    // amount of records that can be displayed in tbody
    this._viewableRecordCount = Math.floor(this._tbodyHeight / TR_HEIGHT);

    // should only have one child element (div)
    var pseudoScroller = this._scrollbar.children().eq(0);

    // set scroll bar height
    pseudoScroller.height(this._grid.stateManager.getRecords().length * TR_HEIGHT);

    // listen to change in scroll bar position
    var me = this;
    this._scrollbar.on('scroll', function () {
        var topRecordIndex = Math.ceil($(this).scrollTop() / TR_HEIGHT);
        me._grid.render(topRecordIndex, topRecordIndex + (me._viewableRecordCount - 1));
    });
};

PseudoScroller.prototype = {

    constructor: PseudoScroller
};

module.exports = PseudoScroller;
