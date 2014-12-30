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
                return c;
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
        return view.columnBottomIndex - (counter);
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
     * Calculate the amount of records that the view can hold.
     * @param Object view
     * @returns Integer
     */
    calculateAmountOfRecords: function (view) {
        return Math.floor(view.TBODY_HEIGHT / view.TR_HEIGHT);
    },

    /**
     * Calculate the amount of records that the view can show.
     * @param Object view
     * @returns Integer
     */
    calculateAmountOfRecordsToShow: function (view) {
        return Math.floor((view.TBODY_HEIGHT - view.SCROLL_BAR_WIDTH) / view.TR_HEIGHT);
    },

    /**
     * Calculate bottom pixel adjustment for last record.
     * @param Object view
     * @returns Integer
     */
    calculateBottomRecordPixelAmount: function (view) {
        return ((this.calculateAmountOfRecordsToShow(view) + 1) * view.TR_HEIGHT) -
            (view.TBODY_HEIGHT - view.SCROLL_BAR_WIDTH);
    }

};