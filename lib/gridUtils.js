var $ = require('jquery'),
    _ = require('underscore');

module.exports = function (options, stateManager) {
    var grid = this;
    var utils = {
        _valueChanged: function (recordId, colId, value) {
            var column = _.findWhere(options.columns, {id: colId});
            var record = stateManager.getRecord(recordId);
            var parsedValue = column.parser(colId, value);
            stateManager.setRecordValue(record, colId, parsedValue);
            this._updateInput(recordId, colId, parsedValue);
        },

        _updateInput: function (recordId, colId, value) {
            var column = _.findWhere(options.columns, {id: colId});

            var input = options.el.find('.booty-body-table tr[data-row-id="' + recordId + '"] ' +
                'td[data-col-id="' + colId + '"] input');
            input.val(column.formatter(colId, value));
        },

        _newRowChanged: function (colId) {
            var newObj = this._getNewRowData();
            grid.ears.trigger('booty-new-row-value-changed', newObj, colId);
        },

        _getNewRowData: function () {
            var tr = options.el.find('.booty-footer-table tr.new-row');
            var newObj = {};
            _.each(options.columns, function (column) {
                var el;
                if (column.type === 'select') {
                    el = tr.find('td[data-col-id="' + column.id + '"] select');
                } else {
                    el = tr.find('td[data-col-id="' + column.id + '"] input');
                }
                var parsedValue = null;
                if (el.is('input') && el.attr('type') === 'checkbox') {
                    parsedValue = el.prop('checked');
                } else {
                    parsedValue = column.parser(column.id, el.val());
                }

                newObj[column.id] = parsedValue;

            }, this);
            return newObj;
        },

        _newRowClicked: function () {
            stateManager.addRecord(this._getNewRowData());

            grid.render();
        },

        _rowClicked: function (recordId, colId) {
            var record = stateManager.getRecord(recordId);
            grid.ears.trigger('row-clicked', {
                record: record,
                recordId: recordId,
                propertyName: colId
            });
        },

        _isColumnSorted: function (id) {
            var sortConfig = _.findWhere(options.sortConfig, {id: id});

            if (sortConfig == null) {
                return null;
            }

            return sortConfig.asc ? 'asc' : 'desc';
        },

        _columnClicked: function (id) {
            var column = _.findWhere(options.columns, {id: id});

            if (!column.sortable) {
                return null;
            }

            var sort = utils._isColumnSorted(id);
            if (sort == null) {
                utils._sort(id, 'asc');
            } else if (sort === 'asc') {
                utils._sort(id, 'desc');
            } else if (sort === 'desc') {
                utils._sort(id, null);
            }
        },

        _getSortType: function (type) {
            var mappings = {
                text: 'string',
                cost: 'float',
                percent: 'float',
                select: 'string',
                date: 'date',
                boolean: 'boolean'
            };
            return mappings[type];
        },

        _sort: function (id, order) {

            var sortConfig = _.findWhere(options.sortConfig, {id: id});
            if (order == null) {
                options.sortConfig.splice(_.indexOf(options.sortConfig, sortConfig), 1);
            }

            if (sortConfig == null) {
                options.sortConfig = [];
                options.sortConfig.push({
                    id: id,
                    asc: true
                });
            } else {
                sortConfig.asc = order === 'asc' ? true : false;
            }

            var sorterConfig = [];
            _.each(options.sortConfig, function (config) {
                var column = _.findWhere(options.columns, {id: config.id});
                sorterConfig.push({
                    name: config.id,
                    type: utils._getSortType(column.type),
                    ascending: config.asc
                });
            });

            grid.render(sorterConfig);
        },

        _validateRow: function (row/*tr*/) {
            var valid = true;
            var inputs = row.find('input'),
                recordId = row.attr('data-row-id');

            _.each(inputs, function (input) {
                var $input = $(input),
                    colId = $input.closest('td').attr('data-col-id');
                if (!this._validate(recordId, colId, $input)) {
                    valid = false;
                }
            }, this);

            return valid;
        },

        _validate: function (recordId, colId, input) {

            // no validation required for check boxes
            if (input.attr('type') === 'checkbox') {
                return true;
            }

            var column = _.findWhere(options.columns, {id: colId});

            var cell = input.closest('td');
            cell.removeClass('has-error');
            cell.attr('data-error-message', '');

            var nullable = column.nullable,
                value = input.val();

            nullable = nullable != null ? JSON.parse(nullable) : false;

            var message = column.validate(column.id, value);
            if (nullable && value.length === 0) {
                message = '';
            }

            if (message.length) {
                // not valid
                cell.addClass('has-error');
                if (nullable) {
                    cell.attr('data-error-message', message);
                } else {
                    cell.attr('data-error-message', 'Required.  ' + message);
                }

            }

            return !message.length;
        },

        _createDeleteRows: function () {
            var firstColumns = options.el.find('td[data-col-id="' + options.columns[0].id + '"]');
            firstColumns.append('<div class="row-delete">' +
                '<button type="button" class="close" aria-hidden="true">&times;</button></div>');
        },

        _removeDeleteRows: function () {
            options.el.find('.row-delete').remove();
        },

        _deleteRow: function (recordId) {
            if (stateManager.getRecordAttributes(stateManager.getRecord(recordId)).canDelete) {
                // can delete
                stateManager.deleteRecord(recordId);
                grid.bodyTable.find('tr[data-row-id="' + recordId + '"]').remove();
            }
        }
    };
    return utils;

};
