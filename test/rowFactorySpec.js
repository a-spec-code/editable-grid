require('./loader');
var expect = require('chai').expect,
    _ = require('underscore'),
    rowFactory = require('rowFactory');

describe('Row Factory', function () {

    beforeEach(function () {
        this.columns = [
            {
                id: 'col_1',
                title: 'Column 1',
                width: '33.3%',
                sortable: true,
                formatter: function (id, value) {
                    return value;
                },
                link: 'link-id'
            },
            {
                id: 'col_2',
                title: 'Column 2',
                width: '33.3%',
                type: 'cost',
                alignment: 'center',
                formatter: function (id, value) {
                    return value;
                }
            },
            {
                id: 'nested.col_3',
                title: 'Column 3',
                width: '33.3%',
                alignment: 'right',
                formatter: function (id, value) {
                    return value;
                }
            }
        ];

        this.obj = {
            id: 'id',
            fooId: 'foo-id',
            'link-id': 'http://www.google.com',
            'row-link-id': 'http://www.yahoo.com',
            col_1: 'a',
            col_2: 'b',
            nested: {
                col_3: 'c'
            }
        };
    });

    afterEach(function () {
        delete this.columns;
        delete this.obj;
    });

    it('Should render a table row with a checkbox column', function () {

        var row = rowFactory.createTableRow({id: 'id', checkbox1: true, checkbox2: false}, {
            id: 'id',
            columns: [
                {
                    id: 'checkbox1',
                    type: 'checkbox',
                    width: '50%',
                    formatter: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'checkbox2',
                    type: 'checkbox',
                    width: '50%',
                    formatter: function (id, value) {
                        return value;
                    }
                }
            ]
        });

        expect(row).to.equal('<tr data-row-id="id">' +
            '<td class="" data-col-id="checkbox1" style="width:50%">' +
            '<input type="checkbox" checked="checked"/>' +
            '</td>' +
            '<td class="" data-col-id="checkbox2" style="width:50%">' +
            '<input type="checkbox"/>' +
            '</td>' +
            '</tr>');
    });

    it('Should render a table row', function () {
        this.columns.push({
            id: 'col_4',
            title: '',
            width: '100%',
            link: 'row-link-id',
            formatter: function (value) {
                return value;
            }
        });
        var row = rowFactory.createTableRow(this.obj, {
            id: 'id',
            columns: this.columns,
            rows: {link: 'row-link-id'},
            stateManager: {
                isEditable: function (rowId, colId) {
                    if (colId === 'col_2') {
                        return true;
                    }
                    return false;
                }
            }
        });
        expect(row).to.equal('<tr data-row-id="id">' +
            '<td class="" data-col-id="col_1" style="width:33.3%">' +
            '<a href="http://www.google.com">a</a></td>' +
            '<td class="alignment-center" data-col-id="col_2" style="width:33.3%">' +
            '<div class="input-group">' +
            '<span class="input-group-addon">$</span>' +
            '<input type="text" class="form-control" value="b"/>' +
            '</div>' +
            '</td>' +
            '<td class="alignment-right" data-col-id="nested.col_3" style="width:33.3%">c</td>' +
            '<td class="" data-col-id="col_4" style="width:100%">' +
            '<a class="glyphicon glyphicon-arrow-right" ' +
            'href="http://www.yahoo.com"></a></td>' +
            '</tr>');

        // use a different id
        row = rowFactory.createTableRow(this.obj, {
            id: 'fooId',
            columns: this.columns,
            rows: {link: 'row-link-id'},
            stateManager: {
                isEditable: function (rowId, colId) {
                    if (colId === 'col_2') {
                        return true;
                    }
                    return false;
                }
            }
        });
        expect(row).to.equal('<tr data-row-id="foo-id">' +
            '<td class="" data-col-id="col_1" style="width:33.3%">' +
            '<a href="http://www.google.com">a</a></td>' +
            '<td class="alignment-center" data-col-id="col_2" style="width:33.3%">' +
            '<div class="input-group">' +
            '<span class="input-group-addon">$</span>' +
            '<input type="text" class="form-control" value="b"/>' +
            '</div>' +
            '</td>' +
            '<td class="alignment-right" data-col-id="nested.col_3" style="width:33.3%">c</td>' +
            '<td class="" data-col-id="col_4" style="width:100%">' +
            '<a class="glyphicon glyphicon-arrow-right" ' +
            'href="http://www.yahoo.com"></a></td>' +
            '</tr>');
    });

    it('Should render a table header row', function () {

        var isColumnSorted = function (id) {
            if (id === 'col_1') {
                return 'asc';
            } else if (id === 'col_2') {
                return 'desc';
            }
            return false;
        };

        var row = rowFactory.createTableHeaderRow({
            columns: this.columns,
            isColumnSorted: isColumnSorted
        });
        expect(row).to.equal('<tr>' +
            '<th data-col-id="col_1" class="sortable" style="width:33.3%">' +
            '<div class="pull-right sorted-ascending"></div>Column 1</th>' +
            '<th data-col-id="col_2" class="" style="width:33.3%">' +
            '<div class="pull-right sorted-descending"></div>Column 2</th>' +
            '<th data-col-id="nested.col_3" class="" style="width:33.3%">' +
            '<div class="pull-right"></div>Column 3</th>' +
            '</tr>');
    });

    it('Should format the cell value', function () {
        var columns = _.map(this.columns, function (column) {
            return _.extend(column, {
                formatter: function (id, value) {
                    switch (id) {
                        case 'col_1':
                            return 'aa';
                        case 'col_2':
                            return 'bb';
                        case 'nested.col_3':
                            return 'cc';
                    }
                    return value;
                },
                link: null
            });
        });
        var stateManager = {
            isEditable: function () {
                return false;
            }
        };
        var row = rowFactory.createTableRow(this.obj, {
            id: 'id',
            columns: columns,
            rows: {},
            stateManager: stateManager
        });
        expect(row).to.equal('<tr data-row-id="id">' +
            '<td class="" data-col-id="col_1" style="width:33.3%">aa</td>' +
            '<td class="alignment-center" data-col-id="col_2" style="width:33.3%">bb</td>' +
            '<td class="alignment-right" data-col-id="nested.col_3" style="width:33.3%">cc</td>' +
            '</tr>');
    });

    it('Should create a footer row for entry', function () {
        var formatter = function (id, value) {
            return value;
        };
        var columns = [
            {
                id: 'string',
                type: 'string',
                width: '20%',
                link: 'link-id',
                formatter: formatter
            },
            {
                id: 'date',
                type: 'date',
                width: '20%',
                formatter: formatter
            },
            {
                id: 'cost',
                type: 'cost',
                width: '20%',
                formatter: formatter
            },
            {
                id: 'percent',
                type: 'percent',
                width: '20%',
                formatter: formatter
            },
            {
                id: 'select',
                type: 'select',
                list: ['a', 'b', 'c'],
                formatter: function (id, value) {
                    switch (value) {
                        case 'a':
                            return 'A';
                        case 'b':
                            return 'B';
                        case 'c':
                            return 'C';
                    }
                    return value;
                },
                width: '20%'
            }
        ];
        var row = rowFactory.createTableFooterAddRow({columns: columns});
        expect(row).to.equal('<tr class="new-row">' +
                '<td class="" data-col-id="string" style="width:20%">' +
                '</td>' +
                '<td class="" data-col-id="date" style="width:20%">' +
                '<div class="input-group">' +
                '<input type="text" class="form-control" placeholder="yyyy-mm-dd" value="">' +
                '<span class="input-group-addon" data-toggle="booty-datepicker">' +
                '<span class="glyphicon glyphicon-calendar"></span>' +
                '</span>' +
                '</div>' +
                '</td>' +
                '<td class="" data-col-id="cost" style="width:20%">' +
                '<div class="input-group">' +
                '<span class="input-group-addon">$</span>' +
                '<input type="text" class="form-control"/>' +
                '</div>' +
                '</td>' +
                '<td class="" data-col-id="percent" style="width:20%">' +
                '<div class="input-group">' +
                '<input type="text" class="form-control"/>' +
                '<span class="input-group-addon">%</span>' +
                '</div>' +
                '</td>' +
                '<td class="" data-col-id="select" style="width:20%">' +
                '<select class="form-control">' +
                '<option value="a">A</option>' +
                '<option value="b">B</option>' +
                '<option value="c">C</option>' +
                '</select>' +
                '</td>' +
                '</tr>'
        );
    });

    it('Should create a footer row for totals', function () {
        var costFormatter = function (id, value) {
            return '$' + value;
        };

        var columns = [
            {
                id: 'string',
                type: 'string',
                width: '33.3%'
            },
            {
                id: 'cost_1',
                type: 'cost',
                width: '33.3%',
                formatter: costFormatter
            },
            {
                id: 'cost_2',
                type: 'cost',
                width: '33.3%',
                formatter: costFormatter
            }
        ];
        var data = [
            {
                string: 'hello',
                cost_1: 1,
                cost_2: '5'
            },
            {
                string: 'morning',
                cost_1: 1,
                cost_2: 5
            },
            {
                string: 'afternoon',
                cost_1: 1,
                cost_2: 5
            }
        ];
        var row = rowFactory.createTableFooterTotalRow({columns: columns, data: data});
        expect(row).to.equal('<tr class="total-row">' +
            '<td class="" data-col-id="string" style="width:33.3%"></td>' +
            '<td class="" data-col-id="cost_1" style="width:33.3%">=$3</td>' +
            '<td class="" data-col-id="cost_2" style="width:33.3%">=$15</td>' +
            '</tr>');
    });

});
