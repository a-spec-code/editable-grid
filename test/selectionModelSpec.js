var _ = require('underscore'),
    expect = require('chai').expect,
    selectionModel = require('selectionModel'),
    StateManager = require('stateManager'),
    Ears = require('elephant-ears'),
    sinon = require('sinon');

describe('Selection Model', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
        this.data = [
            {
                id: '1',
                name: 'a',
                foo: 'I',
                bar: {
                    foo: {
                        deep: 'deep value'
                    }
                }
            },
            {
                id: '2',
                name: 'b',
                foo: 'I'
            },
            {
                id: '3',
                name: 'c'
            }
        ];
        this.options = {
            recordIdName: 'id'
        };
        this.columns = [
            {
                name: 'col-1'
            },
            {
                name: 'col-2'
            }
        ];
        this.ears = new Ears();
        this.view = {
            SCROLL_BAR_WIDTH: 17,   // set in css
            TR_HEIGHT: 30,  // set in css
            TBODY_HEIGHT: 290, // minus header row
            TBODY_WIDTH: 500,
            selected: {
                recordIndex: 0,
                columnIndex: 0
            },
            tbody: {
                find: function () {

                }
            },
            tableBody: {
                css: function () {

                }
            }
        };
        this.grid = {
            _stateManager: new StateManager(this.data, this.columns, this.ears, this.options),
            _view: this.view,
            _options: {
                columns: this.columns
            },
            render: function () {
            }
        };
        this.selectionModel = selectionModel(this.grid);

    });

    afterEach(function () {
        this.sandbox.restore();
        delete this.stateManager;
        delete this.ears;
    });

    it('Should move right', function () {

        this.view.selected = {
            recordIndex: 0,
            columnIndex: 0
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveRight();

        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(0);
        expect(selectSpy.args[0][1]).to.equal(1);

        // should drop to the next row
        this.view.selected = {
            recordIndex: 0,
            columnIndex: 1
        };
        this.selectionModel.moveRight();

        expect(selectSpy.callCount).to.equal(2);
        expect(selectSpy.args[1][0]).to.equal(1);
        expect(selectSpy.args[1][1]).to.equal(0);

        // should not go anywhere if the last cell selected
        this.view.selected = {
            recordIndex: 2,
            columnIndex: 1
        };
        this.selectionModel.moveRight();

        expect(selectSpy.callCount).to.equal(2);

    });

    it('Should move left', function () {
        this.view.selected = {
            recordIndex: 0,
            columnIndex: 1
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveLeft();
        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(0);
        expect(selectSpy.args[0][1]).to.equal(0);

        // should climb to the next row
        this.view.selected = {
            recordIndex: 1,
            columnIndex: 0
        };

        this.selectionModel.moveLeft();

        expect(selectSpy.callCount).to.equal(2);
        expect(selectSpy.args[1][0]).to.equal(0);
        expect(selectSpy.args[1][1]).to.equal(1);

        // first cell in first row so go no where
        this.view.selected = {
            recordIndex: 0,
            columnIndex: 0
        };

        this.selectionModel.moveLeft();

        expect(selectSpy.callCount).to.equal(2);
    });

    it('Should move up', function () {

        this.view.selected = {
            recordIndex: 1,
            columnIndex: 1
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveUp();
        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(0);
        expect(selectSpy.args[0][1]).to.equal(1);

        // should not move anyway
        this.view.selected = {
            recordIndex: 0,
            columnIndex: 1
        };
        this.selectionModel.moveUp();
        expect(selectSpy.callCount).to.equal(1);

    });

    it('Should move down', function () {
        this.view.selected = {
            recordIndex: 0,
            columnIndex: 1
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveDown();
        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(1);
        expect(selectSpy.args[0][1]).to.equal(1);

        // should not move down
        this.view.selected = {
            recordIndex: 2,
            columnIndex: 1
        };

        this.selectionModel.moveDown();
        expect(selectSpy.callCount).to.equal(1);
    });

    it('Should return the selected cell', function (done) {
        this.view.selected = {
            recordIndex: 0,
            columnIndex: 0
        };

        this.sandbox.stub(this.view.tbody, 'find', function (selection) {
            expect(selection).to.equal('tr[data-record-id="1"] td[data-property-name="col-1"]');
            done();
        });

        this.selectionModel.getSelectionTd();

    });

    it('Should select cell and not call render as cell is in view', function () {

        this.view.recordTopIndex = 0;
        this.view.columnTopIndex = 0;
        this.view.columnBottomIndex = 1;

        var renderSpy = this.sandbox.spy(this.grid, 'render');
        var findSpy = this.sandbox.stub(this.view.tbody, 'find', function () {
            return {
                addClass: function () {
                },
                removeClass: function () {
                }
            }
        });

        this.selectionModel.select(0, 0);

        expect(findSpy.callCount).to.equal(2);
        expect(findSpy.args[0][0]).to.equal('.selected');
        expect(findSpy.args[1][0]).to.equal('tr[data-record-id="1"] td[data-property-name="col-1"]');

        expect(this.view.recordTopIndex).to.equal(0);
        expect(this.view.columnTopIndex).to.equal(0);
        expect(this.view.columnBottomIndex).to.equal(1);

        expect(renderSpy.callCount).to.equal(0);

    });

    it('Should select cell and scroll into view', function () {
        this.view.recordTopIndex = 0;
        this.view.columnTopIndex = 0;
        this.view.columnBottomIndex = 1;

        var data = [];
        for (var r = 0; r < 20; r++) {
            data.push({
                id: r
            });
        }
        var renderSpy = this.sandbox.spy(this.grid, 'render');

        this.sandbox.stub(this.grid._stateManager, 'getRecords', function () {
            return data;
        });

        this.sandbox.stub(this.view.tbody, 'find', function () {
            return {
                addClass: function () {
                },
                removeClass: function () {
                }
            }
        });
        var cssValues = {
            bottom: null
        };
        var cssSpy = this.sandbox.stub(this.view.tableBody, 'css', function (key, value) {
            if (value == null) {
                if ((cssValues[key] == null || cssValues[key] === "") && key === 'bottom') {
                    return '0px';   // default value
                }
                return cssValues[key];
            }
            cssValues[key] = value;
        });

        // MOVING DOWN BY ONE SPACE AT A TIME

        expect(cssSpy.callCount).to.equal(0);
        expect(this.view.recordTopIndex).to.equal(0);

        this.selectionModel.select(1, 0);
        expect(cssSpy.callCount).to.equal(1);
        expect(cssSpy.args[0][0]).to.equal('bottom');
        expect(cssSpy.args[0][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(2, 0);
        expect(cssSpy.callCount).to.equal(2);
        expect(cssSpy.args[1][0]).to.equal('bottom');
        expect(cssSpy.args[1][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(3, 0);
        expect(cssSpy.callCount).to.equal(3);
        expect(cssSpy.args[2][0]).to.equal('bottom');
        expect(cssSpy.args[2][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(4, 0);
        expect(cssSpy.callCount).to.equal(4);
        expect(cssSpy.args[3][0]).to.equal('bottom');
        expect(cssSpy.args[3][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(5, 0);
        expect(cssSpy.callCount).to.equal(5);
        expect(cssSpy.args[4][0]).to.equal('bottom');
        expect(cssSpy.args[4][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(6, 0);
        expect(cssSpy.callCount).to.equal(6);
        expect(cssSpy.args[5][0]).to.equal('bottom');
        expect(cssSpy.args[5][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(7, 0);
        expect(cssSpy.callCount).to.equal(7);
        expect(cssSpy.args[6][0]).to.equal('bottom');
        expect(cssSpy.args[6][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(8, 0);
        expect(cssSpy.callCount).to.equal(8);
        expect(cssSpy.args[7][0]).to.equal('bottom');
        expect(cssSpy.args[7][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(0);

        this.selectionModel.select(9, 0);
        expect(cssSpy.callCount).to.equal(10);
        expect(cssSpy.args[8][0]).to.equal('bottom');
        expect(cssSpy.args[8][1]).to.equal(undefined);
        expect(cssSpy.args[9][0]).to.equal('bottom');
        expect(cssSpy.args[9][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(1);
        expect(renderSpy.callCount).to.equal(1);

        this.selectionModel.select(10, 0);
        expect(cssSpy.callCount).to.equal(12);
        expect(cssSpy.args[10][0]).to.equal('bottom');
        expect(cssSpy.args[10][1]).to.equal(undefined);
        expect(cssSpy.args[11][0]).to.equal('bottom');
        expect(cssSpy.args[11][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(2);
        expect(renderSpy.callCount).to.equal(2);

        this.selectionModel.select(11, 0);
        expect(cssSpy.callCount).to.equal(14);
        expect(cssSpy.args[12][0]).to.equal('bottom');
        expect(cssSpy.args[12][1]).to.equal(undefined);
        expect(cssSpy.args[13][0]).to.equal('bottom');
        expect(cssSpy.args[13][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(3);
        expect(renderSpy.callCount).to.equal(3);

        this.selectionModel.select(12, 0);
        expect(cssSpy.callCount).to.equal(16);
        expect(cssSpy.args[14][0]).to.equal('bottom');
        expect(cssSpy.args[14][1]).to.equal(undefined);
        expect(cssSpy.args[15][0]).to.equal('bottom');
        expect(cssSpy.args[15][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(4);
        expect(renderSpy.callCount).to.equal(4);

        this.selectionModel.select(13, 0);
        expect(cssSpy.callCount).to.equal(18);
        expect(cssSpy.args[16][0]).to.equal('bottom');
        expect(cssSpy.args[16][1]).to.equal(undefined);
        expect(cssSpy.args[17][0]).to.equal('bottom');
        expect(cssSpy.args[17][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(5);
        expect(renderSpy.callCount).to.equal(5);

        this.selectionModel.select(14, 0);
        expect(cssSpy.callCount).to.equal(20);
        expect(cssSpy.args[18][0]).to.equal('bottom');
        expect(cssSpy.args[18][1]).to.equal(undefined);
        expect(cssSpy.args[19][0]).to.equal('bottom');
        expect(cssSpy.args[19][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(6);
        expect(renderSpy.callCount).to.equal(6);

        this.selectionModel.select(15, 0);
        expect(cssSpy.callCount).to.equal(22);
        expect(cssSpy.args[20][0]).to.equal('bottom');
        expect(cssSpy.args[20][1]).to.equal(undefined);
        expect(cssSpy.args[21][0]).to.equal('bottom');
        expect(cssSpy.args[21][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(7);
        expect(renderSpy.callCount).to.equal(7);

        this.selectionModel.select(16, 0);
        expect(cssSpy.callCount).to.equal(24);
        expect(cssSpy.args[22][0]).to.equal('bottom');
        expect(cssSpy.args[22][1]).to.equal(undefined);
        expect(cssSpy.args[23][0]).to.equal('bottom');
        expect(cssSpy.args[23][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(8);
        expect(renderSpy.callCount).to.equal(8);

        this.selectionModel.select(17, 0);
        expect(cssSpy.callCount).to.equal(26);
        expect(cssSpy.args[24][0]).to.equal('bottom');
        expect(cssSpy.args[24][1]).to.equal(undefined);
        expect(cssSpy.args[25][0]).to.equal('bottom');
        expect(cssSpy.args[25][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(9);
        expect(renderSpy.callCount).to.equal(9);

        this.selectionModel.select(18, 0);
        expect(cssSpy.callCount).to.equal(28);
        expect(cssSpy.args[26][0]).to.equal('bottom');
        expect(cssSpy.args[26][1]).to.equal(undefined);
        expect(cssSpy.args[27][0]).to.equal('bottom');
        expect(cssSpy.args[27][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(19, 0);
        expect(cssSpy.callCount).to.equal(30);
        expect(cssSpy.args[28][0]).to.equal('bottom');
        expect(cssSpy.args[28][1]).to.equal(undefined);
        expect(cssSpy.args[29][0]).to.equal('bottom');
        expect(cssSpy.args[29][1]).to.equal('27px');
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        // BOTTOM CELL REACHED
        // MOVING ONE SPACE AT A TIME GOING BACK UP
        this.selectionModel.select(18, 0);
        expect(cssSpy.callCount).to.equal(31);
        expect(cssSpy.args[30][0]).to.equal('bottom');
        expect(cssSpy.args[30][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(17, 0);
        expect(cssSpy.callCount).to.equal(32);
        expect(cssSpy.args[31][0]).to.equal('bottom');
        expect(cssSpy.args[31][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(16, 0);
        expect(cssSpy.callCount).to.equal(33);
        expect(cssSpy.args[32][0]).to.equal('bottom');
        expect(cssSpy.args[32][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(15, 0);
        expect(cssSpy.callCount).to.equal(34);
        expect(cssSpy.args[33][0]).to.equal('bottom');
        expect(cssSpy.args[33][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(14, 0);
        expect(cssSpy.callCount).to.equal(35);
        expect(cssSpy.args[34][0]).to.equal('bottom');
        expect(cssSpy.args[34][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(13, 0);
        expect(cssSpy.callCount).to.equal(36);
        expect(cssSpy.args[35][0]).to.equal('bottom');
        expect(cssSpy.args[35][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(12, 0);
        expect(cssSpy.callCount).to.equal(37);
        expect(cssSpy.args[36][0]).to.equal('bottom');
        expect(cssSpy.args[36][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(11, 0);
        expect(cssSpy.callCount).to.equal(38);
        expect(cssSpy.args[37][0]).to.equal('bottom');
        expect(cssSpy.args[37][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(10, 0);
        expect(cssSpy.callCount).to.equal(40);
        expect(cssSpy.args[38][0]).to.equal('bottom');
        expect(cssSpy.args[38][1]).to.equal(undefined);
        expect(cssSpy.args[39][0]).to.equal('bottom');
        expect(cssSpy.args[39][1]).to.equal('');
        expect(this.view.recordTopIndex).to.equal(10);
        expect(renderSpy.callCount).to.equal(10);

        this.selectionModel.select(9, 0);
        expect(cssSpy.callCount).to.equal(41);
        expect(cssSpy.args[40][0]).to.equal('bottom');
        expect(cssSpy.args[40][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(9);
        expect(renderSpy.callCount).to.equal(11);

        this.selectionModel.select(8, 0);
        expect(cssSpy.callCount).to.equal(42);
        expect(cssSpy.args[41][0]).to.equal('bottom');
        expect(cssSpy.args[41][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(8);
        expect(renderSpy.callCount).to.equal(12);

        this.selectionModel.select(7, 0);
        expect(cssSpy.callCount).to.equal(43);
        expect(cssSpy.args[42][0]).to.equal('bottom');
        expect(cssSpy.args[42][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(7);
        expect(renderSpy.callCount).to.equal(13);

        this.selectionModel.select(6, 0);
        expect(cssSpy.callCount).to.equal(44);
        expect(cssSpy.args[43][0]).to.equal('bottom');
        expect(cssSpy.args[43][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(6);
        expect(renderSpy.callCount).to.equal(14);

        this.selectionModel.select(5, 0);
        expect(cssSpy.callCount).to.equal(45);
        expect(cssSpy.args[44][0]).to.equal('bottom');
        expect(cssSpy.args[44][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(5);
        expect(renderSpy.callCount).to.equal(15);

        this.selectionModel.select(4, 0);
        expect(cssSpy.callCount).to.equal(46);
        expect(cssSpy.args[45][0]).to.equal('bottom');
        expect(cssSpy.args[45][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(4);
        expect(renderSpy.callCount).to.equal(16);

        this.selectionModel.select(3, 0);
        expect(cssSpy.callCount).to.equal(47);
        expect(cssSpy.args[46][0]).to.equal('bottom');
        expect(cssSpy.args[46][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(3);
        expect(renderSpy.callCount).to.equal(17);

        this.selectionModel.select(2, 0);
        expect(cssSpy.callCount).to.equal(48);
        expect(cssSpy.args[47][0]).to.equal('bottom');
        expect(cssSpy.args[47][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(2);
        expect(renderSpy.callCount).to.equal(18);

        this.selectionModel.select(1, 0);
        expect(cssSpy.callCount).to.equal(49);
        expect(cssSpy.args[48][0]).to.equal('bottom');
        expect(cssSpy.args[48][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(1);
        expect(renderSpy.callCount).to.equal(19);

        this.selectionModel.select(0, 0);
        expect(cssSpy.callCount).to.equal(50);
        expect(cssSpy.args[49][0]).to.equal('bottom');
        expect(cssSpy.args[49][1]).to.equal(undefined);
        expect(this.view.recordTopIndex).to.equal(0);
        expect(renderSpy.callCount).to.equal(20);

    });
});
