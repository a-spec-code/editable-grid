var _ = require('underscore'),
    rowFactory = require('./rowFactory'),
    utils = require('./gridUtils'),
    listeners = require('./gridListeners'),
    Ears = require('elephant-ears'),
    StateManager = require('./stateManager');


var Grid = function (options) {

    var grid = this;

    // add default props and funcs to options
    options = _.defaults(options, {
        eventNamespace: 'booty',
        sortConfig: [],
        recordIdName: 'id',
        rows: {
            link: false,
            newRow: false,
            totalRow: false
        },
        stateManager: {
            isEditable: function () {
                return false;
            }
        },
        addListeners: function () {

        }
    });

    // add default props and fncs to columns
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

        return _.defaults(column, {
            formatter: formatter,
            parser: parser,
            validate: validate,
            sortable: false,
            nullable: false,
            type: 'text',
            link: null,
            alignment: 'left',
            preCreateCallback: function () {
            }
        });
    });

    grid.ears = new Ears(options.eventNamespace);

    var stateManager = new StateManager(options.data, options.columns, grid.ears, {
        recordIdName: options.recordIdName
    });

    function getEventNamespace(name) {
        if (options.eventNamespace.length) {
            return options.eventNamespace + '.' + name;
        }
        return name;
    }

    grid.ears.on(getEventNamespace('delete-mode'), function (activate) {
        if (activate) {
            grid._createDeleteRows();
        } else {
            grid._removeDeleteRows();
        }
    });

    var createHeaderTable = function (columns) {
        return '<div class="booty-header-table">' +
            '<table class="table table-bordered">' +
            '<thead>' + rowFactory.createTableHeaderRow(
            {
                columns: columns,
                isColumnSorted: grid._isColumnSorted
            }) +
            '</thead>' +
            '</table>' +
            '</div>';
    };

    var createBodyTable = function (sorterConfig) {

        var rowsMarkup = '';

        stateManager.iterator(function (record) {
            rowsMarkup += rowFactory.createTableRow(record, options);
        }, sorterConfig);

        var tableClazzes = 'table table-bordered';
        if (options.rows.link) {
            tableClazzes += ' table-hover';
        }

        return '<div class="booty-body-table">' +
            '<table class="' + tableClazzes + '">' +
            '<tbody>' + rowsMarkup +
            '</tbody>' +
            '</table>' +
            '</div>';
    };

    var createFooterTable = function (options) {

        // opening tags
        var markup = '<div class="booty-footer-table">';
        markup += '<table class="table table-bordered"><tfoot>';

        if (options.rows.totalRow) {
            markup += rowFactory.createTableFooterTotalRow({
                columns: options.columns,
                data: options.data
            });
        }

        if (options.rows.newRow) {
            markup += rowFactory.createTableFooterAddRow({columns: options.columns});
        }

        // closing tags
        markup += '</tfoot></table>';

        if (options.rows.newRow) {
            markup += '<div>';
            markup += '<button type="button" class="new-row pull-right btn btn-link">Add</button>';
            markup += '</div>';
        }

        markup += '</div>';

        return markup;
    };

    // attach grid functions
    _.extend(grid, utils.call(grid, options, stateManager));

    _.extend(grid, {

        trigger: function (name, params) {
            grid.ears.trigger(name, params);
        },

        on: function (name, callback) {
            grid.ears.on(name, callback);
        },

        off: function (name) {
            grid.ears.off(name);
        },

        destroy: function () {
            // remove any previous content
            options.el.empty();
        },

        render: function (sorterConfig) {
            this.destroy();
            // get the height before any contents is rendered
            var height = options.el.height();

            var markup = createHeaderTable(options.columns);
            markup += createBodyTable(sorterConfig);
            markup += createFooterTable(options);

            options.el.append(markup);

            this.headerTableContainer = options.el.find('.booty-header-table');
            this.headerTable = this.headerTableContainer.find('table');
            this.bodyTableContainer = options.el.find('.booty-body-table');
            this.bodyTable = this.bodyTableContainer.find('table');
            this.footerTableContainer = options.el.find('.booty-footer-table');
            this.footerTable = this.footerTableContainer.find('table');

            if (height > 0) {
                // only set the body height if the outer containing div has a height set
                this.bodyTableContainer.height(options.el.height() -
                    this.headerTableContainer.height() - this.footerTableContainer.height());

                this.headerTable.width(this.bodyTable.width() + 1);
            }

            // the below line enforces the browser to calculate heights and widths
            if (options.data.length > 0) {
                this.bodyTableContainer.get(0).scrollHeight >
                this.bodyTableContainer.get(0).clientHeight;
            } else {
                this.bodyTableContainer.height(0);
            }

            // attach grid listeners
            listeners.call(grid, this.headerTableContainer,
                this.bodyTableContainer, this.footerTableContainer, options);

            // allow the user to add custom listeners
            options.addListeners(options.el);
        }

    });
};

module.exports = Grid;
