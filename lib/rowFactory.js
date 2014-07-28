var _ = require('underscore');

var getValue = function getValue(value, path) {
    if (path == null) {
        return value;
    }

    var split = path.split('.');

    var newValue = value[split[0]];
    if (split.length === 1) {
        return newValue;
    }
    split.shift();
    return getValue(newValue, split.join('.'));
};

var getFormattedValue = function (column, obj) {
    if (obj == null) {
        return '';
    }
    var value = getValue(obj, column.id);
    if (value == null) {
        return '';
    }
    return column.formatter(column.id, value);
};

var dateTemplate = _.template('<div class="input-group">' +
    '<input type="text" class="form-control" placeholder="yyyy-mm-dd" value="<%=date%>">' +
    '<span class="input-group-addon" data-toggle="booty-datepicker">' +
    '<span class="glyphicon glyphicon-calendar"></span>' +
    '</span>' +
    '</div>');

var createInput = function (type, value) {
    if (type === 'date') {
        return dateTemplate({
            date: value == null ? '' : value
        });
    }

    // checkbox
    if (type === 'checkbox') {
        if (value) {
            return '<input type="checkbox" checked="checked"/>';
        }
        return '<input type="checkbox"/>';
    }

    if (value == null) {
        return '<input type="text" class="form-control"/>';
    }

    return '<input type="text" class="form-control" value="' + value + '"/>';
};

var cellFactory = {

    createInput: function (column, value) {

        var formattedValue = value;
        if (column.type !== 'checkbox') {
            formattedValue = column.formatter(column.id, value);
            // hack
            if (_.isString(formattedValue) && formattedValue.length) {
                if (column.type === 'percent') {
                    formattedValue = formattedValue.replace('%', '');
                }
                if (column.type === 'cost') {
                    formattedValue = formattedValue.replace('$', '');
                }
            }
        }

        switch (column.type) {
            case 'date':
                return this.createDateInput(column, formattedValue);
            case 'cost':
                return  this.createCostInput(column, formattedValue);
            case 'percent':
                return this.createPercentInput(column, formattedValue);
            case 'select':
                return this.createSelect(column, formattedValue);
            case 'checkbox':
                return this.createCheckboxInput(column, formattedValue);
        }
        return this.createStringInput(column, formattedValue);
    },

    createOpeningCellTag: function (column) {
        var classes = [];

        switch (column.alignment) {
            case 'right':
                classes.push('alignment-right');
                break;
            case 'center':
                classes.push('alignment-center');
                break;
        }

        return '<td class="' + classes.join(',') + '" data-col-id="' + column.id +
            '" style="width:' + column.width + '">';
    },

    createSelect: function (column, value) {
        // opening tag
        var cell = this.createOpeningCellTag(column);

        cell += '<select class="form-control">';

        _.each(_.result(column, 'list'), function (item) {

            if (value === item) {
                cell += '<option value="' + item + '" selected="selected">' +
                    column.formatter(column.id, item) + '</option>';
            } else {
                cell += '<option value="' + item + '">' +
                    column.formatter(column.id, item) + '</option>';
            }

        });

        cell += '</select>';

        // closing tag
        cell += '</td>';

        return cell;
    },

    createStringInput: function (column, value) {
        // opening tag
        var cell = this.createOpeningCellTag(column);

        cell += createInput(column.type, value);

        // closing tag
        cell += '</td>';

        return cell;
    },

    createCheckboxInput: function (column, value) {
        // opening tag
        var cell = this.createOpeningCellTag(column);

        cell += createInput(column.type, value);

        // closing tag
        cell += '</td>';

        return cell;
    },

    createDateInput: function (column, value) {
        // opening tag
        var cell = this.createOpeningCellTag(column);

        cell += createInput(column.type, value);

        // closing tag
        cell += '</td>';

        return cell;
    },

    createCostInput: function (column, value) {
        // opening tag
        var cell = this.createOpeningCellTag(column);

        cell += '<div class="input-group">';
        cell += '<span class="input-group-addon">$</span>';
        cell += createInput(column.type, value);
        cell += '</div>';

        // closing tag
        cell += '</td>';

        return cell;
    },

    createPercentInput: function (column, value) {
        // opening tag
        var cell = this.createOpeningCellTag(column);

        cell += '<div class="input-group">';
        cell += createInput(column.type, value);
        cell += '<span class="input-group-addon">%</span>';
        cell += '</div>';

        // closing tag
        cell += '</td>';

        return cell;
    },

    createTotalCell: function (column, data) {

        // opening tag
        var cell = this.createOpeningCellTag(column);
        if (column.type === 'cost') {
            var values = _.pluck(data, column.id),
                total = 0;
            _.each(values, function (value) {
                var cost = parseFloat(value);
                if (!_.isNaN(cost)) {
                    total += cost;
                }
            });

            cell += '=' + column.formatter(column.id, total);
        }

        // closing tag
        cell += '</td>';

        return cell;
    },

    createTableData: function (options) {
        var column = options.column,
            value = getFormattedValue(column, options.obj);

        // opening table cell markup
        var markup = this.createOpeningCellTag(column);

        if (column.type === 'checkbox' ||
            options.stateManager.isEditable(options.obj.id, column.id)) {
            return this.createInput(column, value);
        } else {
            // value
            if (column.link != null) {
                if (column.link === options.rows.link) {
                    markup += '<a class="glyphicon glyphicon-arrow-right" href="' +
                        options.obj[column.link] + '"></a>';
                } else {
                    markup += '<a href="' + options.obj[column.link] + '">' + value + '</a>';
                }
            } else {
                markup += value;
            }
        }

        // closing table cell markup
        markup += '</td>';

        return markup;
    },

    createTableHeader: function (options) {
        var column = options.column,
            sorted = options.sorted;

        var classes = [],
            sortedClasses = ['pull-right'];

        if (column.sortable) {
            classes.push('sortable');
        }

        if (sorted === 'asc') {
            sortedClasses.push('sorted-ascending');
        } else if (sorted === 'desc') {
            sortedClasses.push('sorted-descending');
        }

        // open markup
        var markup = '<th data-col-id="' + column.id + '" class="' +
            classes.join(' ') + '" style="width:' + column.width + '">';

        // sorting
        markup += '<div class="' + sortedClasses.join(' ') + '"></div>';

        // value
        markup += column.title;

        // close markup
        markup += '</th>';

        return markup;
    }
};

module.exports = {

    createTableHeaderRow: function (options) {
        var row = '<tr>';

        _.each(options.columns, function (column) {

            row += cellFactory.createTableHeader(
                {
                    column: column,
                    sorted: options.isColumnSorted(column.id)
                });
        });

        row += '</tr>';
        return row;
    },

    createTableRow: function (obj, options) {

        var id = obj[options.id];

        var row = '<tr data-row-id="' + id + '">';

        _.each(options.columns, function (column) {
            row += cellFactory.createTableData({
                column: column,
                obj: obj,
                rows: options.rows,
                stateManager: options.stateManager
            });
        });

        row += '</tr>';
        return row;
    },

    createTableFooterAddRow: function (options) {
        var columns = options.columns,
            newRowData = options.data || {};
        // opening tag
        var row = '<tr class="new-row">';

        // cell markup
        _.each(columns, function (column) {

            if (column.link == null) {
                row += cellFactory.createInput(column, newRowData[column.id]);
            } else {
                row += cellFactory.createOpeningCellTag(column) + '</td>';
            }
        }, this);

        // closing tag
        row += '</tr>';

        return row;
    },

    createTableFooterTotalRow: function (options) {
        var columns = options.columns,
            data = options.data;

        // opening tag
        var row = '<tr class="total-row">';

        _.each(columns, function (column) {
            row += cellFactory.createTotalCell(column, data);
        });

        // closing tag
        row += '</tr>';

        return row;
    }
};