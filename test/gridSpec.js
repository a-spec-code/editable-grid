require('./loader');

var _ = require('underscore'),
    $ = require('jquery'),
    expect = require('chai').expect,
    Grid = require('grid');

describe('Grid', function () {

    beforeEach(function () {
        this.columns = [
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
        this.grid = new Grid({
            el: $('<div/>'),
            columns: this.columns,
            data: []
        });
        this.grid.render();
    });

    afterEach(function () {
        delete this.grid;
    });

    it('Should return the grid view', function () {

        var view = this.grid.getView();
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
});
