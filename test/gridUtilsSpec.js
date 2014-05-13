require('./loader');
var _ = require('underscore'),
    $ = require('jquery'),
    expect = require('chai').expect,
    gridUtils = require('gridUtils'),
    sinon = require('sinon'),
    Ears = require('elephant-ears');


describe('Grid Utils', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('Should return whether a column is sorted', function () {
        var options = {
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
    });

    it('Should determine what to do when a column is clicked', function () {
        var options = {
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
            dataOrder: _.clone(data),
            render: function () {
            },
            ears: new Ears()
        };
        var utils = gridUtils.call(grid, options);

        var spy = this.sandbox.spy(grid, 'render'),
            callback = this.sandbox.spy();

        grid.ears.on('booty-new-row', callback);

        expect(spy.callCount).to.equal(0);
        expect(options.data).to.have.length(0);
        expect(grid.dataOrder).to.have.length(0);
        expect(callback.callCount).to.equal(0);
        utils._newRowClicked();

        expect(spy.callCount).to.equal(1);
        expect(options.data).to.have.length(1);
        expect(grid.dataOrder).to.have.length(1);
        expect(options.data[0].id).to.equal('-1');
        expect(options.data[0].string).to.equal('hello');
        expect(options.data[0].cost).to.equal(500.36);
        expect(options.data[0].percent).to.equal(0.455);
        expect(options.data[0].date).to.equal('2014-01-01');
        expect(options.data[0].select).to.equal('a');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].id).to.equal('-1');
    });

    it('Should update the data on an input change event', function () {

        var options = {
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
            ],
            data: [
                {
                    id: 'row-id',
                    'col-a': 'c'
                }
            ]
        };
        var grid = {
            ears: new Ears(),
            render: function () {

            }
        };
        var renderSpy = this.sandbox.spy(grid, 'render');
        var utils = gridUtils.call(grid, options);
        var callback = this.sandbox.spy();
        grid.ears.on('booty-value-updated', callback);

        expect(callback.callCount).to.equal(0);
        expect(options.data[0]['col-a']).to.equal('c');
        utils._valueChanged('row-id', 'col-a', 'b');
        expect(options.data[0]['col-a']).to.equal('ab');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].colId).to.equal('col-a');
        expect(callback.args[0][0].rowId).to.equal('row-id');
        expect(callback.args[0][0].value).to.equal('ab');
        expect(renderSpy.callCount).to.equal(1);


        expect(options.data[0].nested).to.be.undefined;
        utils._valueChanged('row-id', 'nested.foo', 'bar');
        expect(options.data[0].nested.foo).to.equal('bar');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].colId).to.equal('nested.foo');
        expect(callback.args[1][0].rowId).to.equal('row-id');
        expect(callback.args[1][0].value).to.equal('bar');
        expect(renderSpy.callCount).to.equal(2);
    });

    it('Should parse the values when a new value changes', function () {
        var data = [];
        var options = {
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
            dataOrder: _.clone(data),
            render: function () {
            },
            ears: new Ears()
        };
        var utils = gridUtils.call(grid, options);

        var callback = this.sandbox.spy();

        grid.ears.on('booty-new-row-value-changed', callback);

        expect(callback.callCount).to.equal(0);
        utils._newRowChanged();

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].string).to.equal('hello');
        expect(callback.args[0][0].cost).to.equal(500.36);
        expect(callback.args[0][0].percent).to.equal(0.455);
        expect(callback.args[0][0].date).to.equal('2014-01-01');
        expect(callback.args[0][0].select).to.equal('a');
    });

    it('Should fire an event when a row is clicked', function () {

        var options = {
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
            ],
            data: [
                {
                    id: 'row-id',
                    'col-a': 'c'
                }
            ]
        };
        var grid = {
            ears: new Ears()
        };
        var utils = gridUtils.call(grid, options);
        var callback = this.sandbox.spy();
        grid.ears.on('booty-row-clicked', callback);

        expect(callback.callCount).to.equal(0);
        expect(options.data[0]['col-a']).to.equal('c');
        utils._rowClicked('row-id', 'col-a');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].obj.id).to.equal('row-id');
        expect(callback.args[0][0].rowId).to.equal('row-id');
        expect(callback.args[0][0].colId).to.equal('col-a');

    });

    describe('Validation', function () {

        it('Should validate input for a required field', function () {

            var options = {
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
            expect(cell.data('error-message')).to.equal('Required.  This is an error message.');

            input.val('133');   // valid value
            utils._validate('row-1', 'cost-col', input);

            expect(cell.is('.has-error')).to.be.false;
            expect(cell.data('error-message')).to.equal('');
        });

        it('Should validate input for a NON required field', function () {

            var options = {
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
            expect(cell.data('error-message')).to.equal('This is an error message.');

            input.val('133');   // valid value
            utils._validate('row-1', 'cost-col', input);

            expect(cell.is('.has-error')).to.be.false;
            expect(cell.data('error-message')).to.equal('');
        });

        it('Should validate inputs when add button is fired', function () {

            var options = {
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
            el: el,
            data: data
        };
        var ears = new Ears();
        var grid = {
            ears: ears,
            bodyTable: el
        };
        var utils = gridUtils.call(grid, options);

        ears.on('booty-can-delete', function () {
            return true;
        });

        expect(data).to.have.length(3);
        expect(el.find('tr')).to.have.length(3);
        expect(el.find('tr[data-row-id="2"]')).to.have.length(1);

        utils._deleteRow('2');

        expect(data).to.have.length(2);
        expect(data[0].id).to.equal('1');
        expect(data[1].id).to.equal('3');

        expect(el.find('tr')).to.have.length(2);
        expect(el.find('tr[data-row-id="2"]')).to.have.length(0);

    });
});
