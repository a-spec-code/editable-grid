require('./loader');

var _ = require('underscore'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    utils = require('utils');

describe('Utils', function () {

    beforeEach(function () {
        this.columns = [
            {
                name: '1',
                width: 50
            }, {
                name: '1',
                width: 75
            }, {
                name: '1',
                width: 100
            }
        ];
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
        this.columns = [];
    });

    it('Should have the following amount of utility functions', function () {
        expect(_.keys(utils)).to.have.length(8);
    });

    it('Should calculate the total width of all the columns', function () {
        expect(utils.calculateTotalColumnsWidth(this.columns)).to.equal(225);
    });

    it('Should determine if all records can fit into view', function () {

        expect(utils.canFitRecords({
            TBODY_HEIGHT: 90,
            TR_HEIGHT: 30
        }, [{}, {}, {}])).to.be.true;

        expect(utils.canFitRecords({
            TBODY_HEIGHT: 91,
            TR_HEIGHT: 30
        }, [{}, {}, {}])).to.be.true;

        expect(utils.canFitRecords({
            TBODY_HEIGHT: 93,
            TR_HEIGHT: 31
        }, [{}, {}, {}])).to.be.true;

        expect(utils.canFitRecords({
            TBODY_HEIGHT: 89,
            TR_HEIGHT: 30
        }, [{}, {}, {}])).to.be.false;
    });

    it('Should determine if all columns can fit into view', function () {

        expect(utils.canFitColumns({TBODY_WIDTH: 225}, this.columns)).to.be.true;
        expect(utils.canFitColumns({TBODY_WIDTH: 224}, this.columns)).to.be.false;

    });

    it('Should calculate the amount of records that the view can hold', function () {

        var records = [{}, {}];

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 89,
            TR_HEIGHT: 30
        }, records)).to.equal(2);

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 90,
            TR_HEIGHT: 30
        }, records)).to.equal(3);

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 290,
            TR_HEIGHT: 30
        }, records)).to.equal(9);

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 300,
            TR_HEIGHT: 30
        }, records)).to.equal(10);
    });

    it('Should calculate the amount of records that can be shown', function () {

        expect(utils.calculateAmountOfRecordsToShow({
            TBODY_HEIGHT: 290,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(9);

        expect(utils.calculateAmountOfRecordsToShow({
            TBODY_HEIGHT: 300,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(9);

        expect(utils.calculateAmountOfRecordsToShow({
            TBODY_HEIGHT: 316,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(9);

        expect(utils.calculateAmountOfRecordsToShow({
            TBODY_HEIGHT: 317,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(10);
    });

    it('Should calculate the bottom pixel adjustment amount', function () {
        expect(utils.calculateBottomRecordPixelAmount({
            TBODY_HEIGHT: 290,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(27);

        expect(utils.calculateBottomRecordPixelAmount({
            TBODY_HEIGHT: 300,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(17);

        expect(utils.calculateBottomRecordPixelAmount({
            TBODY_HEIGHT: 316,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(1);

        expect(utils.calculateBottomRecordPixelAmount({
            TBODY_HEIGHT: 317,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        })).to.equal(30);
    });

});
