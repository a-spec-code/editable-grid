require('./loader');

var _ = require('underscore'),
    $ = require('jquery'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    Grid = require('grid');

describe('Grid', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('Should return the grid view', function () {

        var columns = [
            {
                name: 'col-1',
                width: 100,
                title: 'boo'
            },
            {
                name: 'col-a',
                width: 300,
                title: 'boo'
            },
            {
                name: 'col-c',
                width: 500,
                title: 'boo'
            }
        ];
        var grid = new Grid({
            el: $('<div/>'),
            columns: columns,
            data: [],
            sortConfig: [
                {
                    name: 'col-a',
                    ascending: true
                }
            ]
        });
        grid.render();

        var view = grid.getView();
        expect(_.keys(view)).to.have.length(2);

        // columns
        expect(view.columns).to.have.length(3);

        expect(_.keys(view.columns[0])).to.have.length(2);
        expect(view.columns[0].name).to.equal('col-1');
        expect(view.columns[0].width).to.equal(100);

        expect(_.keys(view.columns[1])).to.have.length(2);
        expect(view.columns[1].name).to.equal('col-a');
        expect(view.columns[1].width).to.equal(300);

        expect(_.keys(view.columns[0])).to.have.length(2);
        expect(view.columns[2].name).to.equal('col-c');
        expect(view.columns[2].width).to.equal(500);

        // sort config
        expect(view.sortConfig).to.have.length(1);
        var sortConfig = view.sortConfig[0];
        expect(_.keys(sortConfig)).to.have.length(2);
        expect(sortConfig.name).to.equal('col-a');
        expect(sortConfig.ascending).to.be.true;
    });

    it('Should sort the column', function () {
        var container = $('<div/>');
        var columns = [
            {
                name: 'col-1',
                width: 100,
                title: 'boo',
                sortable: true
            }
        ];
        var grid = new Grid({
            el: container,
            columns: columns,
            data: [
                {
                    id: '1',
                    'col-1': 'b'
                },
                {
                    id: '2',
                    'col-1': 'a'
                },
                {
                    id: '3',
                    'col-1': 'c'
                }
            ]
        });
        grid.render();

        var th = container.find('th');
        expect(th.attr('data-property-name')).to.equal('col-1');
        expect(th.is('.sortable')).to.be.true;

        // note the current order
        var td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('b');
        expect(td.eq(1).text()).to.equal('a');
        expect(td.eq(2).text()).to.equal('c');

        // ascending order
        th.trigger('click');   // simulate header click
        th = container.find('th');
        expect(th.is('.sorted-ascending')).to.be.true;
        expect(th.is('.sorted-descending')).to.be.false;
        td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('a');
        expect(td.eq(1).text()).to.equal('b');
        expect(td.eq(2).text()).to.equal('c');

        // descending order
        th = container.find('th');
        th.trigger('click');   // simulate header click
        th = container.find('th');
        expect(th.is('.sorted-ascending')).to.be.false;
        expect(th.is('.sorted-descending')).to.be.true;
        td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('c');
        expect(td.eq(1).text()).to.equal('b');
        expect(td.eq(2).text()).to.equal('a');

        // original order
        th = container.find('th');
        th.trigger('click');   // simulate header click
        th = container.find('th');
        expect(th.is('.sorted-ascending')).to.be.false;
        expect(th.is('.sorted-descending')).to.be.false;
        td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('b');
        expect(td.eq(1).text()).to.equal('a');
        expect(td.eq(2).text()).to.equal('c');
    });

    it('Should add a new row', function () {
        var container = $('<div/>');
        var columns = [
            {
                name: 'col-1',
                width: 100,
                title: 'boo',
                sortable: true
            }
        ];
        var grid = new Grid({
            el: container,
            columns: columns,
            data: []
        });
        grid.render();
        var canAddSpy = function () {
            return true;
        };
        grid.on('booty.can-add', canAddSpy);

        // no records
        var tr = container.find('tbody tr');
        expect(tr).to.have.length(0);
        grid.add();
        tr = container.find('tbody tr');
        expect(tr).to.have.length(1);

        // existing records - should place record underneath
        container = $('<div/>');
        grid = new Grid({
            el: container,
            columns: columns,
            data: [
                {
                    id: '1',
                    'col-1': 'b'
                },
                {
                    id: '2',
                    'col-1': 'a'
                }
            ]
        });
        grid.render();
        grid.on('booty.can-add', canAddSpy);
        grid.add();
        tr = container.find('tbody tr');
        expect(tr).to.have.length(3);
        // the second row is the new row and should be selected
        var td = tr.eq(1).find('td');
        expect(tr.eq(1).attr('data-record-id')).to.equal('-1');
        expect(td.is('.selected')).to.be.true;

        // should add a record from insert key
        td.eq(1).trigger($.Event('keydown', {keyCode: 45}));
        tr = container.find('tbody tr');
        expect(tr).to.have.length(4);

    });

    it('Should pass in record for can add event', function (done) {
        var container = $('<div/>');
        var grid = new Grid({
            el: container,
            columns: [
                {
                    name: 'col-1',
                    width: 100,
                    title: 'boo',
                    sortable: true
                }
            ],
            data: [
                {
                    id: '1',
                    'col-1': 'b'
                },
                {
                    id: '2',
                    'col-1': 'a'
                }
            ]
        });
        grid.render();
        grid.on('booty.can-add', function(record){
            expect(record.id).to.equal('1');
            done();
        });
        grid.add();
    });
});
