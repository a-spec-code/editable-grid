var utils = require('./utils');

module.exports = function (grid) {
    var stateManager = grid._stateManager,
        view = grid._view,
        columns = grid._options.columns;

    view.selected = {
        rowIndex: 0,
        cellIndex: 0
    };
    return {
        select: function (rowIndex, cellIndex) {

            var records = stateManager.getRecords(),
                record = records[rowIndex],
                recordId = stateManager.getRecordId(record),
                column = columns[cellIndex];

            view.tbody.find('.selected').removeClass('selected');
            view.tbody.find('tr[data-record-id="' + recordId + '"] td[data-property-name="' +
            column.name + '"]').addClass('selected');

            if (rowIndex === view.selected.rowIndex && cellIndex === view.selected.cellIndex) {
                // already selected
                return;
            }

            // save new selection
            view.selected = {
                rowIndex: rowIndex,
                cellIndex: cellIndex
            };

            // scroll selection into view
            if (!(rowIndex >= view.recordTopIndex && rowIndex <= view.recordBottomIndex)) {
                // if not in view
                if (rowIndex < view.recordTopIndex) {
                    view.recordTopIndex--;
                    view.recordBottomIndex = utils.calculateRecordBottomIndex(view, records);
                } else if (rowIndex >= view.recordBottomIndex) {
                    view.recordBottomIndex++;
                    view.recordTopIndex = utils.calculateRecordTopIndex(view, records);
                }
            }

            if (!(cellIndex >= view.columnTopIndex && cellIndex <= view.columnBottomIndex)) {
                // if not in view
                if (cellIndex < view.columnTopIndex) {
                    // first visible column
                    view.columnTopIndex--;
                    view.columnBottomIndex = utils.calculateColumnBottomIndex(view, columns);
                } else if (cellIndex === view.columnBottomIndex) {
                    // last visible column
                    view.columnBottomIndex++;
                    view.columnTopIndex = utils.calculateColumnTopIndex(view, columns);
                }
            }


            grid.render();
        },
        moveRight: function () {
            var records = stateManager.getRecords();

            if (view.selected.rowIndex < records.length - 1 && view.selected.cellIndex === columns.length - 1) {
                // last cell with additional rows remaining
                this.select(view.selected.rowIndex + 1, 0);
            } else if (view.selected.rowIndex === records.length - 1 && view.selected.cellIndex === columns.length - 1) {
                // do not move anyway
                return;
            } else {
                // move to next cell on same row
                this.select(view.selected.rowIndex, view.selected.cellIndex + 1);
            }

        },
        moveLeft: function () {

            if (view.selected.rowIndex > 0 && view.selected.cellIndex === 0) {
                // first cell with additional rows remaining
                this.select(view.selected.rowIndex - 1, columns.length - 1);
            } else if (view.selected.rowIndex === 0 && view.selected.cellIndex === 0) {
                // do not move anyway
                return;
            } else {
                // move to prev cell on same row
                this.select(view.selected.rowIndex, view.selected.cellIndex - 1);
            }
        },
        moveDown: function () {
            var records = stateManager.getRecords();
            if (view.selected.rowIndex < records.length - 1) {
                this.select(view.selected.rowIndex + 1, view.selected.cellIndex);
            }
        },
        moveUp: function () {
            if (view.selected.rowIndex > 0) {
                this.select(view.selected.rowIndex - 1, view.selected.cellIndex);
            }
        },
        getSelectionTd: function () {

            var record = stateManager.getRecords()[view.selected.rowIndex],
                recordId = stateManager.getRecordId(record),
                column = columns[view.selected.cellIndex],
                propertyName = column.name;

            return view.tbody.find('tr[data-record-id="' + recordId + '"] ' +
            'td[data-property-name="' + propertyName + '"]');
        }
    };
};
