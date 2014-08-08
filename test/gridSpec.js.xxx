require('./loader');
var $ = require('jquery'),
    _ = require('underscore'),
    expect = require('chai').expect,
    Grid = require('grid'),
    sinon = require('sinon');

describe('Grid', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
        this.el = $('<div></div>');
        this.columns = [
            {
                id: 'a',
                title: 'a',
                width: 'col-xs-4'
            },
            {
                id: 'b',
                title: 'b',
                width: 'col-xs-4'
            },
            {
                id: 'c',
                title: 'c',
                width: 'col-xs-4'
            }
        ];
        this.data = [
            {
                id: 'id-1',
                a: 'a-1',
                b: 'b-1',
                c: 'c-1'
            },
            {
                id: 'id-2',
                a: 'a-2',
                b: 'b-2',
                c: 'c-2'
            }
        ];
        this.grid = new Grid({
            el: this.el,
            columns: this.columns,
            data: this.data,
            rows: {
                newRow: true,
                totalRow: true
            }
        });
        this.grid.render();
    });

    afterEach(function () {
        this.sandbox.restore();
        delete this.grid;
        delete this.el;
        delete this.columns;
        delete this.data;
    });

    it('Should call addListeners in render', function (done) {
        var grid = new Grid({
            el: this.el,
            columns: this.columns,
            data: [],
            addListeners: function (el) {
                expect(this.el).to.equal(el);
                done();
            }
        });
        grid.render();
    });

    it('Should have the correct classes and styles on it', function () {

        var divs = this.el.find('.booty-header-table, .booty-body-table, .booty-footer-table');
        expect(divs).to.have.length(3);
        expect(divs.eq(0).is('.booty-header-table')).to.be.true;
        expect(divs.eq(1).is('.booty-body-table')).to.be.true;

        var tables = this.el.find('table');
        expect(tables).to.have.length(3);
        expect(tables.eq(0).is('.table')).to.be.true;
        expect(tables.eq(0).is('.table-bordered')).to.be.true;

        expect(tables.eq(1).is('.table')).to.be.true;
        expect(tables.eq(1).is('.table-bordered')).to.be.true;

        expect(tables.eq(2).is('.table')).to.be.true;
        expect(tables.eq(2).is('.table-bordered')).to.be.true;
    });

    it('Should make a header table', function () {
        var table = this.el.find('.booty-header-table table');
        expect(table.find('tbody').children()).to.have.length(0);
        var tr = table.find('thead tr');
        expect(tr).to.have.length(1);
        expect(tr.children()).to.have.length(3);
    });

    it('Should make a body table', function () {
        var table = this.el.find('.booty-body-table table');
        expect(table.find('thead').children()).to.have.length(0);
        var trs = table.find('tbody tr');
        expect(trs).to.have.length(2);
        expect(trs.eq(0).children()).to.have.length(3);
    });

    it('Should make new row footer', function () {
        var table = this.el.find('.booty-footer-table table');
        expect(table.find('thead').children()).to.have.length(0);
        expect(table.find('tbody').children()).to.have.length(0);
        var trs = table.find('tfoot tr');
        expect(trs).to.have.length(2);
        expect(trs.eq(0).children()).to.have.length(3);
        expect(trs.eq(0).is('.total-row')).to.be.true;
        expect(trs.eq(1).children()).to.have.length(3);
        expect(trs.eq(1).is('.new-row')).to.be.true;
        var addLink = this.el.find('.booty-footer-table>div .btn.btn-link');
        expect(addLink.text()).to.equal('Add');
        expect(addLink.attr('type')).to.equal('button');
        expect(addLink.is('.pull-right')).to.be.true;
    });

    it('Should have the same width as the body table', function () {
        var headerTable = this.el.find('.booty-header-table table');
        var bodyTable = this.el.find('.booty-body-table table');
        expect(headerTable.width()).to.equal(bodyTable.width());
    });

    it('Should calculate the height for the body table', function () {
        var bodyTableContainer = this.el.find('.booty-body-table');
        expect(bodyTableContainer.height()).to.equal(0);

        var el = $('<div style="height: 500px"></div>');
        var grid = new Grid({
            el: el,
            columns: this.columns,
            data: this.data
        });

        grid.render();

        bodyTableContainer = el.find('.booty-body-table');
        expect(bodyTableContainer.height()).to.equal(500);
    });

    it('Should set default values on columns', function () {
        var options = {
            columns: [
                {
                    id: 'id',
                    width: 'col-xs-3',
                    title: 'title'
                }
            ]
        };

        expect(_.has(options.columns[0], 'formatter')).to.be.false;
        expect(_.has(options.columns[0], 'sortable')).to.be.false;
        expect(_.has(options.columns[0], 'type')).to.be.false;
        expect(_.has(options.columns[0], 'link')).to.be.false;
        expect(_.has(options.columns[0], 'parser')).to.be.false;
        expect(_.has(options.columns[0], 'validate')).to.be.false;
        expect(_.has(options.columns[0], 'preCreateCallback')).to.be.false;
        expect(_.has(options.columns[0], 'alignment')).to.be.false;

        new Grid(options);

        expect(_.isFunction(options.columns[0].formatter)).to.be.true;
        expect(options.columns[0].sortable).to.be.false;
        expect(options.columns[0].type).to.equal('text');
        expect(options.columns[0].link).to.be.null;
        expect(_.isFunction(options.columns[0].parser)).to.be.true;
        expect(_.isFunction(options.columns[0].preCreateCallback)).to.be.true;
        expect(options.columns[0].validate()).to.equal('');
        expect(options.columns[0].nullable).to.be.false;
        expect(options.columns[0].alignment).to.equal('left');
    });

    it('Should set default options for the grid', function () {
        var options = {};

        expect(_.has(options, 'sortConfig')).to.be.false;
        expect(_.has(options, 'recordIdName')).to.be.false;
        expect(_.has(options, 'rows')).to.be.false;
        expect(_.has(options, 'stateManager')).to.be.false;
        expect(_.has(options, 'addListeners')).to.be.false;
        expect(_.has(options, 'eventNamespace')).to.be.false;

        new Grid(options);

        expect(options.sortConfig).to.have.length(0);
        expect(options.recordIdName).to.equal('id');
        expect(options.rows.link).to.be.false;
        expect(options.rows.newRow).to.be.false;
        expect(options.rows.totalRow).to.be.false;
        expect(_.result(options.stateManager, 'isEditable')).to.be.false;
        expect(_.has(options, 'addListeners')).to.be.true;
        expect(options.eventNamespace).to.equal('booty');

    });

    it('Should clear away previous grid when calling render for a second time', function () {
        expect(this.el.children()).to.have.length(3);
        var spy = this.sandbox.spy(this.grid, 'destroy');
        expect(spy.callCount).to.equal(0);
        this.grid.render();
        expect(spy.callCount).to.equal(1);
        expect(this.el.children()).to.have.length(3);
    });

    it('Should sort the data and display in the sorted order', function () {
        var columns = [
            {
                id: 'a',
                sortable: true
            },
            {
                id: 'b'
            }
        ];
        var data = [
            {
                id: '1',
                a: 'b',
                b: 1
            },
            {
                id: '2',
                a: 'c',
                b: 2
            },
            {
                id: '3',
                a: 'a',
                b: 3
            }
        ];
        var grid = new Grid({
            el: this.el,
            data: data,
            columns: columns
        });
        grid.render();

        var tds = this.el.find('.booty-body-table tbody td');

        // row 1
        expect(tds.eq(0).text()).to.equal('b');
        expect(tds.eq(1).text()).to.equal('1');

        // row 2
        expect(tds.eq(2).text()).to.equal('c');
        expect(tds.eq(3).text()).to.equal('2');

        // row 3
        expect(tds.eq(4).text()).to.equal('a');
        expect(tds.eq(5).text()).to.equal('3');

        // sort column "a"
        this.el.find('th[data-col-id="a"]').trigger('click');

        tds = this.el.find('.booty-body-table tbody td');

        // should of sorted column "a" into ascending order

        // row 1
        expect(tds.eq(0).text()).to.equal('a');
        expect(tds.eq(1).text()).to.equal('3');

        // row 2
        expect(tds.eq(2).text()).to.equal('b');
        expect(tds.eq(3).text()).to.equal('1');

        // row 3
        expect(tds.eq(4).text()).to.equal('c');
        expect(tds.eq(5).text()).to.equal('2');

        // sort column "a"
        this.el.find('th[data-col-id="a"]').trigger('click');

        tds = this.el.find('.booty-body-table tbody td');

        // should of sorted column "a" into descending order

        // row 1
        expect(tds.eq(0).text()).to.equal('c');
        expect(tds.eq(1).text()).to.equal('2');

        // row 2
        expect(tds.eq(2).text()).to.equal('b');
        expect(tds.eq(3).text()).to.equal('1');

        // row 3
        expect(tds.eq(4).text()).to.equal('a');
        expect(tds.eq(5).text()).to.equal('3');

        // sort column "a"
        this.el.find('th[data-col-id="a"]').trigger('click');

        tds = this.el.find('.booty-body-table tbody td');

        // should of sorted column "a" into original order

        // row 1
        expect(tds.eq(0).text()).to.equal('b');
        expect(tds.eq(1).text()).to.equal('1');

        // row 2
        expect(tds.eq(2).text()).to.equal('c');
        expect(tds.eq(3).text()).to.equal('2');

        // row 3
        expect(tds.eq(4).text()).to.equal('a');
        expect(tds.eq(5).text()).to.equal('3');
    });

    it('Should append delete button to rows', function () {
        var grid = new Grid({
            el: this.el,
            data: this.data,
            columns: this.columns
        });
        grid.render();

        expect(this.el.find('.row-delete')).to.have.length(0);

        // activate delete buttons
        grid.trigger('delete-mode', true);

        expect(this.el.find('.row-delete')).to.have.length(2);

        // deactivate delete buttons
        grid.trigger('delete-mode', false);

        expect(this.el.find('.row-delete')).to.have.length(0);

    });
});
