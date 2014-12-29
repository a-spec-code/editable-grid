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
            var td = view.tbody.find('tr[data-record-id="' + recordId + '"] td[data-property-name="' +
            column.name + '"]').addClass('selected');
            //console.log(td.offset())
            //console.log(view.scrollbarX.offset())

            if (recordIndex === view.selected.recordIndex && columnIndex === view.selected.columnIndex) {
                // already selected
                return;
            }

            // save new selection
            view.selected = {
                recordIndex: recordIndex,
                columnIndex: columnIndex
            };

            var amountOfRecordsInView = Math.floor((view.TBODY_HEIGHT - view.SCROLL_BAR_WIDTH) / view.TR_HEIGHT);


            var recordView = {
                topIndex: view.recordTopIndex,
                bottomIndex: (view.recordTopIndex + amountOfRecordsInView) - 1 // minus one for index
            };

            var movement = parseInt(view.tableBody.css('bottom'), 10);
            if (movement > 0) {
                recordView.topIndex++;
            }

            // scroll selection into view
            if (!(recordIndex >= recordView.topIndex && recordIndex <= recordView.bottomIndex)) {
                // if not in view
                if (recordIndex < recordView.topIndex) {
                    // moving up
                    console.log('moving up')
                    if (movement === 0) {
                        view.recordTopIndex--;
                    } else {
                        view.tableBody.css('bottom', '0');
                    }
                }
                else if (recordIndex >= recordView.bottomIndex) {
                    // moving down
                    console.log('moving down')

                    if (recordIndex === records.length - 1) {
                        // last record
                        var adjustment = ((amountOfRecordsInView + 1) * view.TR_HEIGHT) - (view.TBODY_HEIGHT - view.SCROLL_BAR_WIDTH);
                        view.tableBody.css('bottom', adjustment + 'px');//TODO - calculate number
                    } else {
                        view.recordTopIndex++;
                        view.tableBody.css('bottom', '0');
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

            grid.render();
        },
        moveRight: function () {
            var records = stateManager.getRecords();

            if (view.selected.recordIndex < records.length - 1 && view.selected.columnIndex === columns.length - 1) {
                // last cell with additional rows remaining
                this.select(view.selected.recordIndex + 1, 0);
            } else if (view.selected.recordIndex === records.length - 1 && view.selected.columnIndex === columns.length - 1) {
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
