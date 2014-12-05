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

            if (cellIndex === -1) {
                // set to last column and previous row
                cellIndex = columns.length - 1;
                rowIndex--;
            } else if (cellIndex > columns.length - 1) {
                // set to first column and next row
                cellIndex = 0;
                rowIndex++;
            }

            var records = stateManager.getRecords();

            if (rowIndex === -1) {
                // set to last row
                rowIndex = records.length - 1;
            } else if (rowIndex > records.length - 1) {
                // set to first row
                rowIndex = 0;
            }

            var columnRange = view.calculateRangeOfColumns(view.columnTopIndex,
                columns, grid._options.width);

            var recordRange = view.calculateRangeOfRecords(view, grid._view.scrollbarY);

            var record = stateManager.getRecords()[rowIndex],
                recordId = stateManager.getRecordId(record),
                column = columns[cellIndex];

            grid._view.tbody.find('.selected').removeClass('selected');
            grid._view.tbody.find('tr[data-record-id="' + recordId + '"] td[data-property-name="' +
                column.id + '"]').addClass('selected');
            view.selected = {
                rowIndex: rowIndex,
                cellIndex: cellIndex
            };

            if (rowIndex < recordRange.topIndex) {
                grid._view.scrollbarY.scrollTop(grid._view.scrollbarY.scrollTop() - view.TR_HEIGHT);
            } else if (rowIndex >= recordRange.bottomIndex) {
                grid._view.scrollbarY.scrollTop(grid._view.scrollbarY.scrollTop() + view.TR_HEIGHT);
            }

            if (cellIndex < columnRange.topIndex) {
                grid._view.scrollbarX.scrollLeft(grid._view.scrollbarX.scrollLeft() - columns[columnRange.topIndex - 1].width);
            } else if (cellIndex >= columnRange.bottomIndex) {
                grid._view.scrollbarX.scrollLeft(grid._view.scrollbarX.scrollLeft() + columns[columnRange.bottomIndex + 1].width);

            }
        },
        moveRight: function () {
            this.select(view.selected.rowIndex, view.selected.cellIndex + 1);
        },
        moveLeft: function () {
            this.select(view.selected.rowIndex, view.selected.cellIndex - 1);
        },
        moveDown: function () {
            this.select(view.selected.rowIndex + 1, view.selected.cellIndex);
        },
        moveUp: function () {
            this.select(view.selected.rowIndex - 1, view.selected.cellIndex);
        }
    };
};
