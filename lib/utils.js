var _ = require('underscore');

module.exports = {

    /**
     Calculate total width from all columns.
     * @param Array columns
     */
    calculateTotalColumnsWidth: function (columns) {
        var total = 0;
        _.each(columns, function (column) {
            if (column.name !== 'empty-last-column') {
                total += column.width;
            }
        });
        return total;
    },

    /**
     * For the width available can all the columns fit into the Grid.
     * @param Object view
     * @param Array columns
     */
    canFitColumns: function (view, columns) {
        return this.calculateTotalColumnsWidth(columns) <= view.TBODY_WIDTH;
    },

    /**
     * Calculate the amount of columns that fit into the view from a starting index.
     * @param Object view
     * @param Array columns
     */
    calculateAmountOfColumns: function (view, columns) {
        var counter = 0,
            total = 0;

        for (var c = view.columnTopIndex; c < columns.length; c++) {
            var column = columns[c];
            if (column.name !== 'empty-last-column') {
                total += column.width;
            }

            if (total <= view.TBODY_WIDTH) {
                counter++;
            } else {
                break;  // stop counting
            }
        }
        return counter;
    },

    /**
     * For the height available can all the rows fit into the Grid.
     * @param Object view
     * @param Array records
     */
    canFitRecords: function (view, records) {
        var totalRowCountRequired = records.length * view.TR_HEIGHT;
        return totalRowCountRequired <= view.TBODY_HEIGHT;
    },

    /**
     * Calculate the amount of records that fit into the view.
     * @param Object view
     */
    calculateAmountOfRecords: function (view) {
        return Math.floor(view.TBODY_HEIGHT / view.TR_HEIGHT);
    }


};