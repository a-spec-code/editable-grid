var _ = require('underscore'),
    $ = require('jquery');

var PseudoScroller = function (grid, tbodyWidth) {
    this._grid = grid;
    this._columns = this._grid._options.columns;
    this._columnWidths = _.pluck(this._columns, 'width');
    this._tbodyWidth = tbodyWidth;
    this._scrollbar = grid.els.scrollbarX;

    var totalColumnWidth = 0;
    _.each(this._columns, function (column) {
        totalColumnWidth += parseInt(column.width, 10);
    });

    // should only have one child element (div)
    var pseudoScroller = this._scrollbar.children().eq(0);

    // set scroll bar height
    pseudoScroller.height(totalColumnWidth);

    // listen to change in scroll bar position
    var me = this;
    this._scrollbar.on('scroll', function () {
        var topRecordIndex = Math.ceil($(this).scrollLeft() / TR_HEIGHT);
        me._grid.render(topRecordIndex, topRecordIndex + (me._viewableRecordCount - 1));
    });
};

PseudoScroller.prototype = {

    constructor: PseudoScroller
};

module.exports = PseudoScroller;
