var _ = require('underscore');

module.exports = {

    /**
     Calculate total width from all columns.
     * @param Array columns
     * @returns Number
     */
    calculateTotalColumnsWidth: function (columns) {
        var total = 0;
        _.each(columns, function (column) {
            total += column.width;
        });
        return total;
    },

    /**
     * For the width available can all the columns fit into the Grid.
     * @param Object view
     * @param Array columns
     * @returns Boolean
     */
    canFitColumns: function (view, columns) {
        return this.calculateTotalColumnsWidth(columns) <= view.TBODY_WIDTH;
    },

    /**
     * Calculate the bottom index column using the top index column.
     * @param Object view
     * @param Array columns
     * @returns Integer
     */
    calculateColumnBottomIndex: function (view, columns) {
        var total = 0;

        for (var c = view.columnTopIndex; c < columns.length; c++) {
            var column = columns[c];
            total += column.width;

            if (total > view.TBODY_WIDTH) {
                return c - 1;
            }
        }
        return columns.length - 1;
    },

    /**
     * Calculate the top index column using the bottom index column.
     * @param Object view
     * @param Array columns
     * @returns Integer
     */
    calculateColumnTopIndex: function (view, columns) {
        var counter = 0,
            total = 0;

        for (var c = view.columnBottomIndex; c >= 0; c--) {
            var column = columns[c];
            total += column.width;

            if (total <= view.TBODY_WIDTH) {
                counter++;
            } else {
                break;  // stop counting
            }
        }
        return view.columnBottomIndex - (counter - 1);
    },

    /**
     * For the height available can all the rows fit into the Grid.
     * @param Object view
     * @param Array records
     * @returns Boolean
     */
    canFitRecords: function (view, records) {
        var totalRowCountRequired = records.length * view.TR_HEIGHT;
        return totalRowCountRequired <= view.TBODY_HEIGHT;
    },

    /**
     * Calculate the amount of records that fit into the view.
     * @param Object view
     * @param Array records
     * @returns Integer
     */
    calculateAmountOfRecords: function (view, records) {
        var totalAvailableHeight = view.TBODY_HEIGHT;
        if (!this.canFitRecords(view, records)) {
            totalAvailableHeight - view.SCROLL_BAR_WIDTH;
        }
        return Math.floor(view.TBODY_HEIGHT / view.TR_HEIGHT);
    },

    /**
     * Calculate the record bottom index in the view.
     * @param Object view
     * @param Array records
     * @returns Integer
     */
    calculateRecordBottomIndex: function (view, records) {
        return view.recordTopIndex + (this.calculateAmountOfRecords(view, records) - 1);
    },

    /**
     * Calculate the record top index in the view.
     * @param Object view
     * @param Array records
     * @returns Integer
     */
    calculateRecordTopIndex: function (view, records) {
        return view.recordBottomIndex - (this.calculateAmountOfRecords(view, records) - 1);
    }


};