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
            tbody: {
                find: function () {
                }
            }
        };
        this.selectionModel = selectionModel({
            _stateManager: new StateManager(this.data, this.columns, this.ears, this.options),
            _view: this.view,
            _options: {
                columns: this.columns
            }
        })

    });

    afterEach(function () {
        this.sandbox.restore();
        delete this.stateManager;
        delete this.ears;
    });

    it('Should move right', function () {

        this.view.selected = {
            rowIndex: 0,
            cellIndex: 0
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveRight();

        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(0);
        expect(selectSpy.args[0][1]).to.equal(1);

        // should drop to the next row
        this.view.selected = {
            rowIndex: 0,
            cellIndex: 1
        };
        this.selectionModel.moveRight();

        expect(selectSpy.callCount).to.equal(2);
        expect(selectSpy.args[1][0]).to.equal(1);
        expect(selectSpy.args[1][1]).to.equal(0);

        // should not go anywhere if the last cell selected
        this.view.selected = {
            rowIndex: 2,
            cellIndex: 1
        };
        this.selectionModel.moveRight();

        expect(selectSpy.callCount).to.equal(2);

    });

    it('Should move left', function () {
        this.view.selected = {
            rowIndex: 0,
            cellIndex: 1
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveLeft();
        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(0);
        expect(selectSpy.args[0][1]).to.equal(0);

        // should climb to the next row
        this.view.selected = {
            rowIndex: 1,
            cellIndex: 0
        };

        this.selectionModel.moveLeft();

        expect(selectSpy.callCount).to.equal(2);
        expect(selectSpy.args[1][0]).to.equal(0);
        expect(selectSpy.args[1][1]).to.equal(1);

        // first cell in first row so go no where
        this.view.selected = {
            rowIndex: 0,
            cellIndex: 0
        };

        this.selectionModel.moveLeft();

        expect(selectSpy.callCount).to.equal(2);
    });

    it('Should move up', function () {

        this.view.selected = {
            rowIndex: 1,
            cellIndex: 1
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveUp();
        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(0);
        expect(selectSpy.args[0][1]).to.equal(1);

        // should not move anyway
        this.view.selected = {
            rowIndex: 0,
            cellIndex: 1
        };
        this.selectionModel.moveUp();
        expect(selectSpy.callCount).to.equal(1);

    });

    it('Should move down', function () {
        this.view.selected = {
            rowIndex: 0,
            cellIndex: 1
        };

        var selectSpy = this.sandbox.stub(this.selectionModel, 'select');

        expect(selectSpy.callCount).to.equal(0);

        this.selectionModel.moveDown();
        expect(selectSpy.callCount).to.equal(1);
        expect(selectSpy.args[0][0]).to.equal(1);
        expect(selectSpy.args[0][1]).to.equal(1);

        // should not move down
        this.view.selected = {
            rowIndex: 2,
            cellIndex: 1
        };

        this.selectionModel.moveDown();
        expect(selectSpy.callCount).to.equal(1);
    });

    it('Should return the selected cell', function (done) {
        this.view.selected = {
            rowIndex: 0,
            cellIndex: 0
        };

        this.sandbox.stub(this.view.tbody, 'find', function (selection) {
            expect(selection).to.equal('tr[data-record-id="1"] td[data-property-name="col-1"]');
            done();
        });

        this.selectionModel.getSelectionTd();

    });
});
