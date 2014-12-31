var utils = require('./utils');

module.exports = function (grid) {
    var stateManager = grid._stateManager,
        view = grid._view,
        columns = grid._options.columns;

    view.selected = {
        recordIndex: 0,
        columnIndex: 0
    };
    return {
        select: function (recordIndex, columnIndex) {

            var records = stateManager.getRecords(),
                record = records[recordIndex],
                recordId = stateManager.getRecordId(record),
                column = columns[columnIndex];

            view.tbody.find('.selected').removeClass('selected');
            view.tbody.find('tr[data-record-id="' + recordId + '"] td[data-property-name="' +
            column.name + '"]').addClass('selected');

            if (recordIndex === view.selected.recordIndex &&
                columnIndex === view.selected.columnIndex) {
                // already selected
                return;
            }

            // note current indexes - used to determine whether a re-render is required
            var bkRecordTopIndex = view.recordTopIndex,
                bkColumnTopIndex = view.columnTopIndex;

            // save new selection
            view.selected = {
                recordIndex: recordIndex,
                columnIndex: columnIndex
            };

            var recordView = {
                topIndex: view.recordTopIndex,
                // minus one for index
                bottomIndex: (view.recordTopIndex + utils.calculateAmountOfRecordsToShow(view)) - 1
            };

            var bottomPixelAdjustment = parseInt(view.tableBody.css('bottom'), 10);
            if (bottomPixelAdjustment > 0) {
                // force condition below to fail so the adjustment is removed
                recordView.topIndex++;
            }

            // scroll selection into view
            if (!(recordIndex >= recordView.topIndex && recordIndex <= recordView.bottomIndex)) {
                // if not in view
                if (recordIndex < recordView.topIndex) {
                    // moving up
                    if (bottomPixelAdjustment === 0) {
                        view.recordTopIndex--;
                    } else {
                        view.tableBody.css('bottom', '');
                    }
                }
                else if (recordIndex >= recordView.bottomIndex) {
                    // moving down
                    //if (recordIndex === records.length - 1) {
                    if ((utils.calculateAmountOfRecords(view) + view.recordTopIndex) ===
                        records.length - 1) {
                        // all records are rendered, just need to adjust view
                        if (bottomPixelAdjustment > 0 && bottomPixelAdjustment !==
                            utils.calculateBottomRecordPixelAmount(view) + view.TR_HEIGHT) {
                            view.tableBody.css('bottom',
                                (bottomPixelAdjustment + view.TR_HEIGHT) + 'px');
                        } else {
                            view.tableBody.css('bottom',
                                utils.calculateBottomRecordPixelAmount(view) + 'px');
                        }
                    } else {
                        view.recordTopIndex++;
                        view.tableBody.css('bottom', '');
                    }
                }
            }
            //if (!(columnIndex >= view.columnTopIndex && columnIndex <= view.columnBottomIndex)) {
            if (columnIndex < view.columnTopIndex) {
                if (view.columnTopIndex - columnIndex >= 2) {
                    view.columnTopIndex = columnIndex;
                } else {
                    // just moving from one cell over
                    view.columnTopIndex--;
                }
                view.columnBottomIndex = utils.calculateColumnBottomIndex(view, columns);
            } else if (view.columnBottomIndex === columns.length - 1) {
                view.columnBottomIndex = columnIndex;
                view.columnTopIndex = utils.calculateColumnTopIndex(view, columns);

            } else if (view.columnBottomIndex - columnIndex === 1) {
                if (columnIndex - view.columnBottomIndex >= 2) {
                    view.columnBottomIndex = columnIndex;
                } else {
                    // just moving from one cell over
                    view.columnBottomIndex++;
                }
                view.columnTopIndex = utils.calculateColumnTopIndex(view, columns);
            }
            //}

            // only render if indexes have changed
            if (bkRecordTopIndex !== view.recordTopIndex ||
                bkColumnTopIndex !== view.columnTopIndex) {
                grid.render();
            }
        },
        moveRight: function () {
            var records = stateManager.getRecords();

            if (view.selected.recordIndex < records.length - 1 &&
                view.selected.columnIndex === columns.length - 1) {
                // last cell with additional rows remaining
                this.select(view.selected.recordIndex + 1, 0);
            } else if (view.selected.recordIndex === records.length - 1 &&
                view.selected.columnIndex === columns.length - 1) {
                // do not move anyway
                return;
            } else {
                // move to next cell on same row
                this.select(view.selected.recordIndex, view.selected.columnIndex + 1);
            }

        },
        moveLeft: function () {

            if (view.selected.recordIndex > 0 && view.selected.columnIndex === 0) {
                // first cell with additional rows remaining
                this.select(view.selected.recordIndex - 1, columns.length - 1);
            } else if (view.selected.recordIndex === 0 && view.selected.columnIndex === 0) {
                // do not move anyway
                return;
            } else {
                // move to prev cell on same row
                this.select(view.selected.recordIndex, view.selected.columnIndex - 1);
            }
        },
        moveDown: function () {
            var records = stateManager.getRecords();
            if (view.selected.recordIndex < records.length - 1) {
                this.select(view.selected.recordIndex + 1, view.selected.columnIndex);
            }
        },
        moveUp: function () {
            if (view.selected.recordIndex > 0) {
                this.select(view.selected.recordIndex - 1, view.selected.columnIndex);
            }
        },
        getSelectionTd: function () {

            var record = stateManager.getRecords()[view.selected.recordIndex],
                recordId = stateManager.getRecordId(record),
                column = columns[view.selected.columnIndex],
                propertyName = column.name;

            return view.tbody.find('tr[data-record-id="' + recordId + '"] ' +
            'td[data-property-name="' + propertyName + '"]');
        }
    };
};
