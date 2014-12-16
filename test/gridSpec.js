require('./loader');

var _ = require('underscore'),
    $ = require('jquery'),
    expect = require('chai').expect,
    Grid = require('grid');

describe('Grid', function () {

    it('Should return the grid view', function () {

        var columns = [
            {
                id: 'col-1',
                width: 100,
                title: 'boo'
            },
            {
                id: 'col-a',
                width: 300,
                title: 'boo'
            },
            {
                id: 'col-c',
                width: 500,
                title: 'boo'
            }
        ];
        var grid = new Grid({
            el: $('<div/>'),
            columns: columns,
            data: []
        });
        grid.render();

        var view = grid.getView();
        expect(view.columns).to.have.length(3);

        expect(_.keys(view.columns[0])).to.have.length(2);
        expect(view.columns[0].id).to.equal('col-1');
        expect(view.columns[0].width).to.equal(100);

        expect(_.keys(view.columns[1])).to.have.length(2);
        expect(view.columns[1].id).to.equal('col-a');
        expect(view.columns[1].width).to.equal(300);

        expect(_.keys(view.columns[0])).to.have.length(2);
        expect(view.columns[2].id).to.equal('col-c');
        expect(view.columns[2].width).to.equal(500);
    });

    it('Should sort the column', function () {
        var container = $('<div/>');
        var columns = [
            {
                id: 'col-1',
                width: 100,
                title: 'boo'
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

        // note the current order
        var td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('b');
        expect(td.eq(1).text()).to.equal('a');
        expect(td.eq(2).text()).to.equal('c');

        // ascending order
        th.trigger('click');   // simulate header click
        td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('a');
        expect(td.eq(1).text()).to.equal('b');
        expect(td.eq(2).text()).to.equal('c');

        // descending order
        container.find('th').trigger('click');   // simulate header click
        td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('c');
        expect(td.eq(1).text()).to.equal('b');
        expect(td.eq(2).text()).to.equal('a');

        // original order
        container.find('th').trigger('click');   // simulate header click
        td = container.find('tbody td:not([data-property-name="empty-last-column"])');
        expect(td).to.have.length(3);
        expect(td.eq(0).text()).to.equal('b');
        expect(td.eq(1).text()).to.equal('a');
        expect(td.eq(2).text()).to.equal('c');
    });
});
