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
            selected: {
                recordIndex: 0,
                columnIndex: 0
            },
            tbody: {
                find: function () {

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

    it('Should select cell and force render if cell not in view', function () {

        this.view.recordTopIndex = 0;
        this.view.recordBottomIndex = 2;
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
        expect(this.view.recordBottomIndex).to.equal(2);
        expect(this.view.columnTopIndex).to.equal(0);
        expect(this.view.columnBottomIndex).to.equal(1);

        expect(renderSpy.callCount).to.equal(0);

    });
});
