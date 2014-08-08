require('./loader');

var $ = require('jquery'),
    expect = require('chai').expect,
    PseudoScroller = require('pseudoScroller'),
    sinon = require('sinon');

describe('Pseudo Scroller', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
        this.grid = {
            els: {
                scrollbarY: $('<div><div></div></div>')
            },
            stateManager: {
                getRecords: function () {
                    return 400;
                }
            },
            render: function (/*topRecordIndex, bottomRecordIndex*/) {
            }
        };
        this.pseudoScroller = new PseudoScroller(this.grid, 600);
    });

    afterEach(function () {
        delete this.pseudoScroller;
        this.sandbox.restore();
    });

    it('Should have the correct properties set on object', function () {
        expect(this.pseudoScroller._grid).to.equal(this.grid);
        expect(this.pseudoScroller._tbodyHeight).to.equal(600);
        expect(this.pseudoScroller._scrollbar).to.equal(this.grid.els.scrollbarY);
        expect(this.pseudoScroller._viewableRecordCount).to.equal(20);
    });

    it('Should have scroll listener attached', function () {
        var renderSpy = this.sandbox.spy(this.grid, 'render');

        expect(renderSpy.callCount).to.equal(0);

        this.pseudoScroller._scrollbar.trigger('scroll');

        expect(renderSpy.callCount).to.equal(1);
        expect(renderSpy.args[0][0]).to.equal(0);
        expect(renderSpy.args[0][1]).to.equal(19);

        this.pseudoScroller._scrollbar.scrollTop(60);
        this.pseudoScroller._scrollbar.trigger('scroll');

        expect(renderSpy.callCount).to.equal(2);
        expect(renderSpy.args[1][0]).to.equal(2);
        expect(renderSpy.args[1][1]).to.equal(21);
    });

});
