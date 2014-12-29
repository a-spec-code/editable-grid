var $ = require('jquery'),
    _ = require('underscore'),
    Ears = require('elephant-ears'),
    StateManager = require('./stateManager'),
    EditBoxes = require('./editBoxes'),
    listeners = require('./listeners'),
    selectionModel = require('./selectionModel'),
    utils = require('./utils');

function initOptions(options) {

    // add default properties and functions to options
    options = _.defaults(options, {
        eventNamespace: 'booty',
        sortConfig: [],
        recordIdName: 'id',
        height: 300,
        width: 500,
        TR_HEIGHT: 30
    });

    // add default props and fncs to columns
    options.totalColumnsWidth = 0;
    options.columns = _.map(options.columns, function (column) {

        var formatter = function (id, value) {
            return value;
        };
        var parser = function (id, value) {
            return value;
        };
        var validate = function () {
            return '';
        };

        column.width = column.width || 100;
        column.width = parseInt(column.width, 10);  // remove any 'px'
        options.totalColumnsWidth += column.width;
        return _.defaults(column, {
            formatter: formatter,
            parser: parser,
            validate: validate,
            sortable: false,
            type: 'text',
            sortType: 'string',
            alignment: 'left'
        });
    });

    return options;
}


var Grid = function (options) {

    this._options = initOptions(options);
    this._ears = new Ears(options.eventNamespace);
    this._editBoxes = new EditBoxes();
    this._stateManager = new StateManager(this._options.data, this._options.columns, this._ears, {
        recordIdName: options.recordIdName
    });

    var TR_HEIGHT = this._options.TR_HEIGHT;

    this._view = {
        SCROLL_BAR_WIDTH: 17,   // set in css
        TR_HEIGHT: TR_HEIGHT,  // set in css
        TBODY_HEIGHT: this._options.height - TR_HEIGHT, // minus header row
        TBODY_WIDTH: this._options.width,
        columnTopIndex: 0,  // index of the first column displayed
        columnBottomIndex: null,  // index of the last column displayed
        recordTopIndex: 0,  // index of the first record displayed
        recordBottomIndex: null,  // index of the last record displayed
        columnIndexes: {},
        rowIndexes: {},
        sortConfig: this._options.sortConfig
    };

    // create base markup
    var template = require('./haml/grid.haml');
    var el = this._options.el;
    el.append(template());

    this._view.tableContainerHeader = el.find('.table-container-header');
    this._view.tableContainerBody = el.find('.table-container-body');
    this._view.tableHeader = el.find('.table-header');
    this._view.tableBody = el.find('.table-body');
    this._view.thead = el.find('.table-header thead');
    this._view.tbody = el.find('.table-body tbody');
    this._view.scrollbarY = el.find('.scrollbar-container-vertical');
    this._view.scrollbarX = el.find('.scrollbar-container-horizontal');
    this._view.columnResizeLine = el.find('.column-resize-line');

    // add surrounding class
    el.addClass('booty-grid');

    // set width and height
    el.width(this._options.width);
    el.height(this._options.height);

    // selection model
    this._selectionModel = selectionModel(this);
    // attach listeners
    this._listeners = listeners(this);
};

Grid.prototype = {

    _sort: function (propertyName) {
        var view = this._view,
            column = _.findWhere(this._options.columns, {name: propertyName});

        // is the current column already sorted?
        var sortConfig = _.findWhere(view.sortConfig, {name: propertyName});

        if (sortConfig) {
            if (sortConfig.ascending) {
                // already sorted by ascending so now sort descending
                sortConfig.ascending = false;
            } else {
                // sorted by descending so clear sort
                view.sortConfig = [];
            }
        } else {
            // create a new sort config
            view.sortConfig = [
                {
                    name: propertyName,
                    ascending: true,
                    type: column.sortType
                }
            ];
        }
        this.render();
    },

    _setColumnWidth: function (propertyName, width) {
        var columns = this._options.columns,
            column = columns[this._view.columnIndexes[propertyName]];

        column.width = parseFloat(width);

        this.render();
    },

    _edit: function () {

        var stateManager = this._stateManager,
            editBoxes = this._editBoxes,
            view = this._view,
            selectionModel = this._selectionModel,
            columns = this._options.columns;

        var record = stateManager.getRecords()[view.selected.recordIndex],
            propertyName = columns[view.selected.columnIndex].name;

        var column = columns[view.columnIndexes[propertyName]];

        var editBox = $(editBoxes[column.type]().markup);

        var me = this;
        editBox.on('keydown', function (e) {
            var value = $(this).val();
            switch (e.keyCode) {
                case 13:    /*enter*/
                    // set value
                    stateManager.setRecordValue(record, propertyName, value);

                    // close editbox
                    editBox.remove();

                    // render
                    me.render();
                    break;
                case 27:    /* escape */
                    // close editbox
                    // no changes should be saved
                    editBox.remove();

                    // render
                    me.render();
                    break;
            }
        });

        var td = selectionModel.getSelectionTd(),
            position = td.position();

        editBox.addClass('edit-box');
        editBox.css('width', td.width() + 1);
        editBox.css('height', td.height() + 1);

        editBox.css('top', position.top + 1);
        editBox.css('left', position.left + 1);
        view.tableContainerBody.append(editBox);

        // focus
        editBox.focus();
    },

    getView: function () {
        var view = {
            columns: [],
            sortConfig: []
        };

        // sort configuration
        _.each(this._view.sortConfig, function (sortConfig) {
            view.sortConfig.push({
                name: sortConfig.name,
                ascending: sortConfig.ascending
            });
        });

        // columns
        _.each(this._options.columns, function (column) {
            view.columns.push({
                name: column.name,
                width: column.width
            });
        });
        return view;
    },

    add: function () {
        var recordIndex = this._view.selected.recordIndex;
        var record = this._stateManager.getRecords()[recordIndex];
        if (this.trigger('can-add', record)) {
            // obtain the current selected record and place new record underneath
            var nextPosition = recordIndex + 1;

            // create and add new record
            var newRecord = this._stateManager.createRecord();
            this._stateManager.addRecord(newRecord, nextPosition);

            // refresh the grid and select the new record
            this._view.selected.recordIndex = nextPosition;
            this.render();
        }

    },

    delete: function () {
        var recordIndex = this._view.selected.recordIndex;
        var record = this._stateManager.getRecords()[recordIndex];
        if (record && this.trigger('can-delete', record)) {
            // delete the record
            this._stateManager.deleteRecord(this._stateManager.getRecordId(record));

            // refresh the grid
            this.render();
        }
    },

    trigger: function (name, params) {
        return this._ears.trigger(name, params);
    },

    on: function (name, callback) {
        this._ears.on(name, callback);
    },

    one: function (name, callback) {
        this._ears.one(name, callback);
    },

    off: function (name) {
        this._ears.off(name);
    },

    destroy: function () {
        delete this._ears;
        delete this._stateManager;
    },

    render: function () {

        var time = (new Date()).getTime();

        var stateManager = this._stateManager,
            columns = this._options.columns,
            records = stateManager.getRecords(),
            thead = this._view.thead,
            tbody = this._view.tbody,
            view = this._view;

        // turn off listeners
        this._listeners.disable();

        // empty rows
        thead.empty();
        tbody.empty();

        // set table body height
        var bodyHeight = records.length * view.TR_HEIGHT;
        if (!utils.canFitRecords(view, records)) {
            bodyHeight = view.TBODY_HEIGHT;
        }
        //view.tableContainer.eq(0).height(view.TR_HEIGHT);
        //view.tableContainer.eq(0).css('overflow-x', 'hidden');

        view.tableContainerBody.height(bodyHeight);
        view.tableBody.height(bodyHeight);
        //view.tableContainer.eq(1).css('overflow', 'hidden');

        // clear indexes
        view.columnIndexes = {};
        view.rowIndexes = {};

        if (view.columnBottomIndex == null) {
            view.columnBottomIndex = utils.calculateColumnBottomIndex(view, columns);
        }

        // create table headers
        var tr = '<tr>';

        for (var c = view.columnTopIndex; c <= view.columnBottomIndex; c++) {
            var column = columns[c],
                sortConfig = _.findWhere(view.sortConfig, {name: column.name}),
                styles = [],
                classes = [];

            styles.push('width:' + column.width + 'px');

            if (column.sortable) {
                classes.push('sortable');
            }
            if (sortConfig) {
                if (sortConfig.ascending) {
                    classes.push('sorted-ascending');
                } else {
                    classes.push('sorted-descending');
                }
            }

            tr += '<th class="' + classes.join(' ') + '" data-property-name="' + column.name +
            '" style="' + styles.join(';') + '">' + column.title +
            '<div class="sort-icon"/><div class="column-resize"/></th>';

            // store column index
            view.columnIndexes[column.name] = c;
        }

        tr += '</tr>';

        thead.append(tr);
        // create table rows
        stateManager.iterator(function (record, index) {
            var recordId = this.getRecordId(record);
            var tr = '<tr data-record-id="' + recordId + '">';

            for (var c = view.columnTopIndex; c <= view.columnBottomIndex; c++) {
                var column = columns[c];

                var styles = [];
                styles.push('width:' + column.width + 'px');

                var td = '<td style="' + styles.join(';') + '" data-property-name="' +
                    column.name + '">';

                var value = stateManager.getRecordValue(record, column.name);
                value = (value == null) ? '' : value;

                td += '<div>' + value + '</div>';

                td += '</td>';

                tr += td;
            }

            tr += '</tr>';
            tbody.append(tr);

            // store row index
            view.rowIndexes[record.id] = index;
        }, view.sortConfig, {
            topIndex: view.recordTopIndex,
            bottomIndex: view.recordTopIndex + utils.calculateAmountOfRecords(view, records) // because this is an index this counts as an
                                                                       // extra record
        });

        // scroll bar calibration
        if (utils.canFitColumns(view, columns)) {
            // hide horizontal scroll bar
            view.scrollbarX.css('display', 'none');
        } else {
            // show horizontal scroll bar
            view.scrollbarX.css('display', '');
            // calculate scroller height
            var scrollerHorizontal = view.scrollbarX.find('.scrollbar-horizontal');
            var width = scrollerHorizontal.width() / columns.length;
            if (width < 20) {
                width = 20;
            }
            scrollerHorizontal.find('.scrollbar-scroller').width(width);
        }
        if (utils.canFitRecords(view, records)) {
            // hide vertical scroll bar
            view.scrollbarY.css('display', 'none');
        } else {
            // show vertical scroll bar
            view.scrollbarY.css('display', '');
            // calculate scroller height
            var scrollerVertical = view.scrollbarY.find('.scrollbar-vertical');
            var height = scrollerVertical.height() / records.length;
            if (height < 20) {
                height = 20;
            }
            scrollerVertical.find('.scrollbar-scroller').height(height);
        }

        $('h4').eq(0)
            .text('Render Time - ' + (((new Date()).getTime() - time) * 0.001) + ' seconds');

        this._view.tableBody.focus();
        if (stateManager.getRecords().length) {
            this._selectionModel.select(view.selected.recordIndex, view.selected.columnIndex);
        }

        // turn on listeners
        this._listeners.enable();
    }
};

module.exports = Grid;
