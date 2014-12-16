var _ = require('underscore'),
    $ = require('jquery');

module.exports = function (grid) {
    var columns = grid._options.columns,
        scrollbarX = grid._view.scrollbarX,
        scrollbarY = grid._view.scrollbarY,
        view = grid._view,
        tableContainer = grid._view.tableContainer,
        tableHeader = grid._view.tableHeader,
        tableBody = grid._view.tableBody,
        selectionModel = grid._selectionModel;

    var lastScroll = 0;

    var throttleScrollbarX = _.throttle(function () {
        var el = $(this),
            scroll = el.scrollLeft();

        if (lastScroll === scroll) {
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


    var throttleScrollbarY = _.throttle(function () {
        grid.render();
    }, 50);


    var tableBodyKeyDown = function (e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:    // left arrow
                selectionModel.moveLeft();
                break;
            case 39:    // right arrow
                selectionModel.moveRight();
                break;
            case 38:    // up arrow
                selectionModel.moveUp();
                break;
            case 40:    // down arrow
                selectionModel.moveDown();
                break;
            case 113:   // f2
                grid._edit();
                break;
        }
        e.preventDefault();
    };

    var tableBodyClick = function (e) {
        var td = $(e.target).closest('td'),
            columnId = td.attr('data-property-name'),
            tr = td.closest('tr'),
            recordId = tr.attr('data-record-id');

        selectionModel.select(view.rowIndexes[recordId], view.columnIndexes[columnId]);
    };

    var tableBodyDblclick = function () {
        grid._edit();
    };

    var tableHeaderColumnResizeMousedown = function (e) {
        var th = $(e.target).closest('th');

        view.columnResize = {
            propertyName: th.attr('data-property-name'),
            startPositionLeft: th.position().left
        };
        view.columnResizeLine.css('left', th.position().left + $(this).position().left + 2);
        view.columnResizeLine.css('display', 'inline');

        e.stopPropagation();
        e.preventDefault();
    };

    var tableHeaderClick = function (e) {
        var propertyName = $(this).attr('data-property-name');

        grid._sort(propertyName);

        e.stopPropagation();
        e.preventDefault();
    };

    var tableContainerMouseup = function () {

        if (view.columnResize) {

            var propertyName = view.columnResize.propertyName,
                startPositionLeft = view.columnResize.startPositionLeft,
                endPositionLeft = view.columnResizeLine.position().left;

            // deactivate column resize
            view.columnResize = null;
            view.columnResizeLine.css('display', '');

            // set new column width
            grid._setColumnWidth(propertyName, endPositionLeft - startPositionLeft);
        }
    };

    var tableContainerMousemove = _.throttle(function (e) {
        if (view.columnResize) {
            view.columnResizeLine.css('left', e.pageX - $(this).offset().left);
        }
    }, 100);

    return {

        /**
         * Enable Events
         */
        enable: function () {
            scrollbarX.on('scroll', throttleScrollbarX);
            scrollbarY.on('scroll', throttleScrollbarY);
            tableBody.on('keydown', tableBodyKeyDown);
            tableBody.on('click', tableBodyClick);
            tableBody.on('dblclick', tableBodyDblclick);
            tableContainer.on('mouseup', tableContainerMouseup);
            tableHeader.on('mousedown', '.column-resize', tableHeaderColumnResizeMousedown);
            tableHeader.on('click', 'th:not([data-property-name="empty-last-column"])',
                tableHeaderClick);
            tableContainer.on('mousemove', tableContainerMousemove);
        },

        /**
         * Disable events
         */
        disable: function () {
            scrollbarX.off('scroll');
            scrollbarY.off('scroll');
            tableBody.off('keydown');
            tableBody.off('click');
            tableBody.off('dblclick');
            tableContainer.off('mouseup');
            tableHeader.off('mousedown', '.column-resize');
            tableHeader.off('click', 'th:not([data-property-name="empty-last-column"])');
            tableContainer.off('mousemove');
        }
    };
};
