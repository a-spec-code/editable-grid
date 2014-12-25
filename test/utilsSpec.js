require('./loader');

var sinon = require('sinon'),
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

    it('Should calculate the amount of records that can be shown in view', function () {

        var records = [{}, {}];

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 89,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        }, records)).to.equal(2);

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 90,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17
        }, records)).to.equal(3);
    });

    it('Should calculate the bottom index for columns', function () {
        this.columns.push({
            name: 'a',
            width: 30
        });
        this.columns.push({
            name: 'a',
            width: 10
        });
        this.columns.push({
            name: 'a',
            width: 5
        });
        this.columns.push({
            name: 'a',
            width: 45
        });

        expect(utils.calculateColumnBottomIndex({TBODY_WIDTH: 100, columnTopIndex: 0}, this.columns))
            .to.equal(0);
        expect(utils.calculateColumnBottomIndex({TBODY_WIDTH: 100, columnTopIndex: 4}, this.columns))
            .to.equal(6);
        expect(utils.calculateColumnBottomIndex({TBODY_WIDTH: 20, columnTopIndex: 5}, this.columns))
            .to.equal(5);
    });

    it('Should calculate the top index for columns', function () {
        this.columns.push({
            name: 'a',
            width: 30
        });
        this.columns.push({
            name: 'a',
            width: 10
        });
        this.columns.push({
            name: 'a',
            width: 5
        });
        this.columns.push({
            name: 'a',
            width: 45
        });

        expect(utils.calculateColumnTopIndex({TBODY_WIDTH: 100, columnBottomIndex: 6}, this.columns))
            .to.equal(3);
        expect(utils.calculateColumnTopIndex({TBODY_WIDTH: 100, columnBottomIndex: 4}, this.columns))
            .to.equal(3);
        expect(utils.calculateColumnTopIndex({TBODY_WIDTH: 20, columnBottomIndex: 5}, this.columns))
            .to.equal(4);
    });

    it('Should calculate the record top index', function () {

        var records = [{}, {}, {}];

        expect(utils.calculateRecordTopIndex({
            TBODY_HEIGHT: 89,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17,
            recordBottomIndex: 2
        }, records)).to.equal(1);

    });

    it('Should calculate the record bottom index', function () {

        var records = [{}, {}, {}];

        expect(utils.calculateRecordBottomIndex({
            TBODY_HEIGHT: 89,
            TR_HEIGHT: 30,
            SCROLL_BAR_WIDTH: 17,
            recordTopIndex: 0
        }, records)).to.equal(1);

    });
});
