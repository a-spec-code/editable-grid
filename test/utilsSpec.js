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
            }, {
                name: 'empty-last-column',
                width: 50
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

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 89,
            TR_HEIGHT: 30
        })).to.equal(2);

        expect(utils.calculateAmountOfRecords({
            TBODY_HEIGHT: 90,
            TR_HEIGHT: 30
        })).to.equal(3);
    });

    it('Should calculate the amount of columns that can be shown in view', function () {
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

        expect(utils.calculateAmountOfColumns({TBODY_WIDTH: 100, columnTopIndex: 0}, this.columns))
            .to.equal(1);
        expect(utils.calculateAmountOfColumns({TBODY_WIDTH: 100, columnTopIndex: 4}, this.columns))
            .to.equal(4);
        expect(utils.calculateAmountOfColumns({TBODY_WIDTH: 20, columnTopIndex: 5}, this.columns))
            .to.equal(2);
    });
});
