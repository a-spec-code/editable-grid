var _ = require('underscore'),
    $ = require('jquery');

module.exports = function (grid) {
    var columns = grid._options.columns,
        scrollbarX = grid._els.scrollbarX,
        scrollbarY = grid._els.scrollbarY,
        view = grid._view,
        tableBody = grid._els.tableBody,
        selectionModel = grid._selectionModel;

    var lastScroll = 0;

    var throttleScrollbarX = _.throttle(function () {
        var el = $(this),
            scroll = el.scrollLeft();

        if (lastScroll == scroll) {
            return false;
        }

        if (scroll > lastScroll) {
            view.columnTopIndex += 1;
        } else {
            view.columnTopIndex -= 1;
        }

        lastScroll = 0;
        for (var c = 0; c < view.columnTopIndex; c++) {
            lastScroll += columns[c].width;
        }

        el.scrollLeft(lastScroll);

        grid.render();
    }, 0);

    scrollbarX.on('scroll', throttleScrollbarX);

    var throttleScrollbarY = _.throttle(function () {
        grid.render();
    }, 50);

    scrollbarY.on('scroll', throttleScrollbarY);

    tableBody.on('keydown', function (e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:    // left arrow
                console.log('left arrow')
                selectionModel.moveLeft();
                break;
            case 39:    // right arrow
                console.log('right arrow')
                selectionModel.moveRight();
                break;
            case 38:    // up arrow
                selectionModel.moveUp();
                console.log('up arrow')
                break;
            case 40:    // down arrow
                selectionModel.moveDown();
                console.log('down arrow')
                break;
        }
        e.preventDefault();
    });


};
