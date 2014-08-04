require('./loader');
var _ = require('underscore'),
    $ = require('jquery'),
    expect = require('chai').expect,
    gridUtils = require('gridUtils'),
    sinon = require('sinon'),
    Ears = require('elephant-ears'),
    StateManager = require('stateManager');


describe('Grid Utils', function () {

    beforeEach(function () {
        this.ears = new Ears();
        this.columns = [];
        this.stateManager = new StateManager([
            {
                id: 'row-id',
                'col-a': 'c'
            }
        ], this.columns, this.ears, {
            recordIdName: 'id'
        });
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('Should return whether a column is sorted', function () {
        var options = {
            id: 'id',
            sortConfig: [
                {
                    id: 'col-a',
                    asc: true
                },
                {
                    id: 'col-b',
                    asc: false
                }
            ],
            columns: [
                {
                    id: 'col-a'
                },
                {
                    id: 'col-b'
                },
                {
                    id: 'col-c'
                }
            ]
        };

        var utils = gridUtils(options);

        expect(utils._isColumnSorted('col-a')).to.equal('asc');
        expect(utils._isColumnSorted('col-b')).to.equal('desc');
        expect(utils._isColumnSorted('col-c')).to.be.null;

    });

    it('Should set sort type according to column type', function () {
        var utils = gridUtils.call({}, {});
        expect(utils._getSortType('text')).to.equal('string');
        expect(utils._getSortType('date')).to.equal('date');
        expect(utils._getSortType('select')).to.equal('string');
        expect(utils._getSortType('cost')).to.equal('float');
        expect(utils._getSortType('percent')).to.equal('float');
        expect(utils._getSortType('boolean')).to.equal('boolean');
    });

    it('Should determine what to do when a column is clicked', function () {
        var options = {
            id: 'id',
            sortConfig: [
                {
                    id: 'col-a',
                    asc: true
                },
                {
                    id: 'col-b',
                    asc: false
                }
            ],
            columns: [
                {
                    id: 'col-a',
                    sortable: true,
                    type: 'string'
                },
                {
                    id: 'col-b',
                    sortable: true,
                    type: 'cost'
                },
                {
                    id: 'col-c',
                    sortable: false,
                    type: 'select'
                },
                {
                    id: 'col-d',
                    sortable: false,
                    type: 'date'
                },
                {
                    id: 'col-e',
                    sortable: false,
                    type: 'percent'
                }
            ],
            data: []
        };
        var grid = {render: function () {
        }};
        var utils = gridUtils.call(grid, options);

        var spy = this.sandbox.spy(utils, '_sort');


        expect(spy.callCount).to.equal(0);

        utils._columnClicked('col-a');

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('col-a');
        expect(spy.args[0][1]).to.equal('desc');
        expect(options.sortConfig).to.have.length(2);
        expect(options.sortConfig[0].asc).to.be.false;

        utils._columnClicked('col-b');

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('col-b');
        expect(spy.args[1][1]).to.be.null;
        expect(options.sortConfig).to.have.length(1);

        utils._columnClicked('col-b');

        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.equal('col-b');
        expect(spy.args[2][1]).to.equal('asc');
        expect(options.sortConfig).to.have.length(1);
        expect(options.sortConfig[0].asc).to.be.true;


        // sort function should not be called as column is not allowed to be sorted
        utils._columnClicked('col-c');

        expect(spy.callCount).to.equal(3);
    });

    it('Should parse the values and add a new row', function () {
        var data = [];
        var options = {
            id: 'id',
            el: $('<div><div class="booty-footer-table"><tr class="new-row">' +
                '<td data-col-id="string"><input value="hello"/></td>' +
                '<td data-col-id="cost"><input value="500.36"/></td>' +
                '<td data-col-id="percent"><input value="45.5"/></td>' +
                '<td data-col-id="date"><input value="2014-01-01"/></td>' +
                '<td data-col-id="select"><select><option value="a"></option>' +
                '<option value="b"></option></td>' +
                '</tr></div></div>'),
            columns: [
                {
                    id: 'string',
                    type: 'string',
                    parser: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'cost',
                    type: 'cost',
                    parser: function (id, value) {
                        return parseFloat(value);
                    }
                },
                {
                    id: 'percent',
                    type: 'percent',
                    parser: function (id, value) {
                        return parseFloat(value) / 100;
                    }
                },
                {
                    id: 'date',
                    type: 'date',
                    parser: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'select',
                    type: 'select',
                    list: ['a', 'b', 'c'],
                    parser: function (id, value) {
                        return value;
                    }
                }
            ],
            data: data
        };
        var grid = {
            data: data,
            render: function () {
            },
            ears: new Ears()
        };
        var utils = gridUtils.call(grid, options, this.stateManager);

        var renderSpy = this.sandbox.spy(grid, 'render'),
            addRecordSpy = this.sandbox.spy(this.stateManager, 'addRecord');

        expect(renderSpy.callCount).to.equal(0);
        expect(addRecordSpy.callCount).to.equal(0);

        utils._newRowClicked();

        expect(renderSpy.callCount).to.equal(1);
        expect(addRecordSpy.callCount).to.equal(1);
        var newRecord = addRecordSpy.args[0][0];
        expect(newRecord.id).to.equal('-1');
        expect(newRecord.string).to.equal('hello');
        expect(newRecord.cost).to.equal(500.36);
        expect(newRecord.percent).to.equal(0.455);
        expect(newRecord.date).to.equal('2014-01-01');
        expect(newRecord.select).to.equal('a');

    });

    it('Should update the data on an input change event', function () {

        var options = {
            el: $('<div><div class="booty-body-table"><tr data-row-id="row-id">' +
                '<td data-col-id="col-a"><input/></td>' +
                '<td data-col-id="nested.foo"><input/></td></tr></div></div>'),
            id: 'id',
            columns: [
                {
                    id: 'col-a',
                    parser: function (id, value) {
                        return 'a' + value;
                    },
                    formatter: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'nested.foo',
                    parser: function (id, value) {
                        return value;
                    },
                    formatter: function (id, value) {
                        return value;
                    }
                }
            ]
        };
        var grid = {
            render: function () {

            }
        };

        var utils = gridUtils.call(grid, options, this.stateManager);

        expect(this.stateManager.getRecords()[0]['col-a']).to.equal('c');
        utils._valueChanged('row-id', 'col-a', 'b');
        expect(this.stateManager.getRecords()[0]['col-a']).to.equal('ab');
        var input = options.el.find('input').eq(0);
        expect(input.val()).to.equal('ab');


        expect(this.stateManager.getRecords()[0].nested).to.be.undefined;
        utils._valueChanged('row-id', 'nested.foo', 'bar');
        expect(this.stateManager.getRecords()[0].nested.foo).to.equal('bar');
        input = options.el.find('input').eq(1);
        expect(input.val()).to.equal('bar');
    });

    it('Should parse the values when a new value changes', function () {
        var data = [];
        var options = {
            id: 'id',
            el: $('<div><div class="booty-footer-table"><tr class="new-row">' +
                '<td data-col-id="string"><input value="hello"/></td>' +
                '<td data-col-id="cost"><input value="500.36"/></td>' +
                '<td data-col-id="percent"><input value="45.5"/></td>' +
                '<td data-col-id="date"><input value="2014-01-01"/></td>' +
                '<td data-col-id="checkbox"><input type="checkbox" checked="checked"/></td>' +
                '<td data-col-id="select"><select><option value="a"></option>' +
                '<option value="b"></option></td>' +
                '</tr></div></div>'),
            columns: [
                {
                    id: 'string',
                    type: 'string',
                    parser: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'cost',
                    type: 'cost',
                    parser: function (id, value) {
                        return parseFloat(value);
                    }
                },
                {
                    id: 'percent',
                    type: 'percent',
                    parser: function (id, value) {
                        return parseFloat(value) / 100;
                    }
                },
                {
                    id: 'date',
                    type: 'date',
                    parser: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'select',
                    type: 'select',
                    list: ['a', 'b', 'c'],
                    parser: function (id, value) {
                        return value;
                    }
                },
                {
                    id: 'checkbox',
                    type: 'checkbox'
                }
            ],
            data: data
        };
        var grid = {
            data: data,
            dataOrder: _.clone(data),
            render: function () {
            },
            ears: new Ears()
        };
        var utils = gridUtils.call(grid, options);

        var callback = this.sandbox.spy();

        grid.ears.on('booty-new-row-value-changed', callback);

        expect(callback.callCount).to.equal(0);
        utils._newRowChanged('colId');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].string).to.equal('hello');
        expect(callback.args[0][0].cost).to.equal(500.36);
        expect(callback.args[0][0].percent).to.equal(0.455);
        expect(callback.args[0][0].date).to.equal('2014-01-01');
        expect(callback.args[0][0].select).to.equal('a');
        expect(callback.args[0][0].checkbox).to.be.true;
        expect(callback.args[0][1]).to.equal('colId');
    });

    it('Should fire an event when a row is clicked', function () {

        var options = {
            id: 'id',
            columns: [
                {
                    id: 'col-a',
                    parser: function (id, value) {
                        return 'a' + value;
                    }
                },
                {
                    id: 'nested.foo',
                    parser: function (id, value) {
                        return value;
                    }
                }
            ]
        };
        var grid = {
            ears: new Ears()
        };
        var utils = gridUtils.call(grid, options, this.stateManager);
        var callback = this.sandbox.spy();
        grid.ears.on('row-clicked', callback);

        expect(callback.callCount).to.equal(0);
        expect(this.stateManager.getRecords()[0]['col-a']).to.equal('c');
        utils._rowClicked('row-id', 'col-a');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].record.id).to.equal('row-id');
        expect(callback.args[0][0].recordId).to.equal('row-id');
        expect(callback.args[0][0].propertyName).to.equal('col-a');

    });

    describe('Validation', function () {

        it('Should validate input for a required field', function () {

            var options = {
                id: 'id',
                columns: [
                    {
                        id: 'cost-col',
                        validate: function (id, value) {
                            var cost = parseFloat(value);
                            if (_.isNaN(cost)) {
                                return 'This is an error message.';
                            }
                            return '';
                        }
                    }
                ]
            };
            var grid = {
                ears: new Ears()
            };
            var utils = gridUtils.call(grid, options);

            var cell = $('<td><input value="foo"/></td>'),  // an invalid value
                input = cell.find('input');

            expect(cell.is('.has-error')).to.be.false;

            utils._validate('row-1', 'cost-col', input);

            expect(cell.is('.has-error')).to.be.true;
            expect(cell.attr('data-error-message'))
                .to.equal('Required.  This is an error message.');

            input.val('133');   // valid value
            utils._validate('row-1', 'cost-col', input);

            expect(cell.is('.has-error')).to.be.false;
            expect(cell.attr('data-error-message')).to.equal('');

            // checkbox
            expect(utils._validate('row-id', 'col-id', $('<input type="checkbox"/>'))).to.be.true;
        });

        it('Should validate input for a NON required field', function () {

            var options = {
                id: 'id',
                columns: [
                    {
                        id: 'cost-col',
                        nullable: true,
                        validate: function (id, value) {
                            var cost = parseFloat(value);
                            if (_.isNaN(cost)) {
                                return 'This is an error message.';
                            }
                            return '';
                        }
                    }
                ]
            };
            var grid = {
                ears: new Ears()
            };
            var utils = gridUtils.call(grid, options);

            var cell = $('<td><input value="foo"/></td>'),  // an invalid value
                input = cell.find('input');

            expect(cell.is('.has-error')).to.be.false;

            utils._validate('row-1', 'cost-col', input);

            expect(cell.is('.has-error')).to.be.true;
            expect(cell.attr('data-error-message')).to.equal('This is an error message.');

            input.val('133');   // valid value
            utils._validate('row-1', 'cost-col', input);

            expect(cell.is('.has-error')).to.be.false;
            expect(cell.attr('data-error-message')).to.equal('');
        });

        it('Should validate inputs when add button is fired', function () {

            var options = {
                id: 'id',
                el: $('<div><div class="booty-footer-table"><tr data-row-id="new-row">' +
                    '<td data-col-id="cost"><input value="blah"/></td>' +
                    '<td data-col-id="percent"><input value="blah"/></td>' +
                    '</tr></div></div>'),
                columns: [
                    {
                        id: 'cost',
                        validate: function (id, value) {
                            var cost = parseFloat(value);
                            if (_.isNaN(cost)) {
                                return 'Error with cost.';
                            }
                            return '';
                        }
                    },
                    {
                        id: 'percent',
                        validate: function (id, value) {
                            var percent = parseFloat(value);
                            if (_.isNaN(percent)) {
                                return 'Error with present.';
                            }
                            return '';
                        }
                    }
                ]
            };
            var grid = {
                ears: new Ears()
            };
            var utils = gridUtils.call(grid, options);

            var row = options.el.find('tr'),
                costCell = options.el.find('td[data-col-id="cost"]'),
                percentCell = options.el.find('td[data-col-id="percent"]');

            expect(costCell.is('.has-error')).to.be.false;
            expect(percentCell.is('.has-error')).to.be.false;

            expect(utils._validateRow(row)).to.be.false;

            expect(costCell.is('.has-error')).to.be.true;
            expect(percentCell.is('.has-error')).to.be.true;

            costCell.find('input').val('133');   // valid value
            percentCell.find('input').val('20');   // valid value

            expect(utils._validateRow(row)).to.be.true;

            expect(costCell.is('.has-error')).to.be.false;
            expect(percentCell.is('.has-error')).to.be.false;
        });
    });

    it('Should remove the row and delete the data item', function () {
        var data = [
            {
                id: '1'
            },
            {
                id: '2'
            },
            {
                id: '3'
            }
        ];
        var el = $('<div><tr data-row-id="1"></tr><tr data-row-id="2"></tr>' +
            '<tr data-row-id="3"></tr></div>');
        var options = {
            id: 'id',
            el: el,
            data: data
        };
        var grid = {
            bodyTable: el
        };
        this.stateManager._data = options.data;
        var utils = gridUtils.call(grid, options, this.stateManager);
        var deleteRecordSpy = this.sandbox.spy(this.stateManager, 'deleteRecord');

        expect(deleteRecordSpy.callCount).to.equal(0);
        expect(el.find('tr')).to.have.length(3);
        expect(el.find('tr[data-row-id="2"]')).to.have.length(1);

        utils._deleteRow('2');

        expect(deleteRecordSpy.callCount).to.equal(1);
        expect(el.find('tr')).to.have.length(2);
        expect(el.find('tr[data-row-id="2"]')).to.have.length(0);

    });
});
