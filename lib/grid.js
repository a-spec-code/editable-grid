var $ = require('jquery'),
    _ = require('underscore'),
    Ears = require('elephant-ears'),
    StateManager = require('./stateManager'),
    EditBoxes = require('./editBoxes'),
    listeners = require('./listeners'),
    selectionModel = require('./selectionModel');

function initOptions(options) {

    // add default properties and functions to options
    options = _.defaults(options, {
        eventNamespace: 'booty',
        sortConfig: [],
        recordIdName: 'id',
        height: 300,
        width: 800
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

        column.width = parseInt(column.width, 10);  // remove any 'px'
        options.totalColumnsWidth += column.width;
        return _.defaults(column, {
            formatter: formatter,
            parser: parser,
            validate: validate,
            sortable: false,
            type: 'text',
            alignment: 'left'
        });
    });
    return options;
}

//function getEventNamespace(name) {
//    if (options.eventNamespace.length) {
//        return options.eventNamespace + '.' + name;
//    }
//    return name;
//}

function calculateRangeOfColumns(topIndex, columns, width) {

    var total = 0,
        bottomIndex = 0;

    for (var c = topIndex; c < columns.length; c++) {
        total += columns[c].width;
        if (total > width) {
            bottomIndex = c;
            break;
        }
    }
    return {
        topIndex: topIndex,
        bottomIndex: bottomIndex
    };
}

function calculateRangeOfRecords(view, scrollbarY) {
    console.log('Scroll bar top - ' + scrollbarY.scrollTop());
    var scrollbarTop = scrollbarY.scrollTop();
    var topIndex = Math.floor(scrollbarTop / view.TR_HEIGHT);

    if (scrollbarTop === view.scrollbarYBottom) {
        topIndex = 39;
    }

    console.log('top index  - ' + topIndex)
    return {
        topIndex: topIndex,
        bottomIndex: topIndex + (view.viewableRecordCount - 1)
    };
}

var Grid = function (options) {

    this._options = initOptions(options);
    this._ears = new Ears(options.eventNamespace);
    this._editBoxes = new EditBoxes();
    this._stateManager = new StateManager(this._options.data, this._options.columns, this._ears, {
        recordIdName: options.recordIdName
    });

    var TBODY_HEIGHT = this._options.height - 33 - 15;

    this._view = {
        TR_HEIGHT: 30,
        columnTopIndex: 0,
        columnIndexes: {},
        rowIndexes: {}
    };
    this._view.viewableRecordCount = Math.ceil(TBODY_HEIGHT / this._view.TR_HEIGHT);
    this._view.calculateRangeOfRecords = calculateRangeOfRecords;
    this._view.calculateRangeOfColumns = calculateRangeOfColumns;

    // create base markup
    var template = require('../haml/grid.haml');
    var el = this._options.el;
    el.append(template());

    this._view['tableContainer'] = $('.table-container');
    this._view['tableHeader'] = $('.table-header');
    this._view['tableBody'] = $('.table-body');
    this._view['thead'] = $('.table-header thead');
    this._view['tbody'] = $('.table-body tbody');
    this._view['scrollbarY'] = $('.scrollbar-y');
    this._view['scrollbarX'] = $('.scrollbar-x');

    // add surrounding class
    el.addClass('booty-grid');

    // set width and height
    el.width(this._options.width);
    el.height(this._options.height);
    var tableWidth = this._options.width - 16;
    this._view.tableContainer.width(tableWidth);

    // set horizontal scroll bar scroll width
    this._view.scrollbarX.width(tableWidth);
    this._view.scrollbarX.children().eq(0).width(this._options.totalColumnsWidth);
    this._view.scrollbarY.height(TBODY_HEIGHT);
    var scrollHeight = this._stateManager.getRecords().length * this._view.TR_HEIGHT;
    this._view.scrollbarY.children().eq(0).height(scrollHeight);

    this._view.scrollbarYBottom = scrollHeight - TBODY_HEIGHT;

    this._selectionModel = selectionModel(this);
    // attach listeners
    listeners(this);
};

Grid.prototype = {

    getView: function () {
        return this._view;
    },

    trigger: function (name, params) {
        this._ears.trigger(name, params);
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
            thead = this._view.thead,
            tbody = this._view.tbody,
            view = this._view;

        // empty rows
        thead.empty();
        tbody.empty();

        // clear indexes
        view.columnIndexes = {};
        view.rowIndexes = {};

        var columnRange = this._view.calculateRangeOfColumns(view.columnTopIndex,
            columns, this._options.width);

        var recordRange = this._view.calculateRangeOfRecords(view, this._view.scrollbarY);

        // create table headers
        var tr = '<tr>';

        for (var c = columnRange.topIndex; c <= columnRange.bottomIndex; c++) {
            var column = columns[c];
            var styles = [];
            styles.push('width:' + column.width + 'px');

            tr += '<th style="' + styles.join(';') + '">' + column.title + '</th>';

            // store column index
            view.columnIndexes[column.id] = c;
        }

        tr += '</tr>';

        thead.append(tr);

        // create table rows
        stateManager.iterator(function (record, index) {
            var recordId = this.getRecordId(record);
            var tr = '<tr data-record-id="' + recordId + '">';

            for (var c = columnRange.topIndex; c <= columnRange.bottomIndex; c++) {
                var column = columns[c];

                var styles = [];
                styles.push('width:' + column.width + 'px');

                var td = '<td style="' + styles.join(';') + '" data-property-name="' +
                    column.id + '">';

                td += '<div>' + stateManager.getRecordValue(record, column.id) + '</div>';

                td += '</td>';

                tr += td;
            }

            tr += '</tr>';

            tbody.append(tr);

            // store row index
            view.rowIndexes[record.id] = index;
        }, [], recordRange);

        $('h4').eq(0)
            .text('Render Time - ' + (((new Date()).getTime() - time) * 0.001) + ' seconds')

        this._view.tableBody.focus();
        this._selectionModel.select(view.selected.rowIndex, view.selected.cellIndex);
    }
};

module.exports = Grid;
