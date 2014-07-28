require('./loader');
var expect = require('chai').expect,
    $ = require('jquery'),
    gridListeners = require('gridListeners'),
    sinon = require('sinon');

describe('Grid Listeners', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
        this.headerContainer = $('<div class="booty-header-table"><table>' +
            '<thead>' +
            '<tr>' +
            '<th data-col-id="col-a"></th>' +
            '<th data-col-id="col-b"></th>' +
            '</tr></thead>' +
            '</table></div>');
        this.bodyContainer = $('<div class="booty-body-table"><table>' +
            '<tbody><tr data-row-id="row-id"><div class="row-delete"><button></button>' +
            '</div><td data-col-id="col-a"><input id="input"/></td>' +
            '<td data-col-id="col-b"><select><option value="a">A</option> ' +
            '<option value="b">B</option></select></td>' +
            '<td data-col-id="col-c">><input id="checkbox" type="checkbox"/></td>' +
            '</tr></tbody>' +
            '</table></div>');
        this.footerContainer = $('<div><table>' +
            '<tfoot><tr data-row-id="new-row"><td data-col-id="col-a"><input/></td>' +
            '<td data-col-id="col-b"><select><option value="a">A</option> ' +
            '<option value="b">B</option></select></td></tr></tfoot>' +
            '</table>' +
            '<button class="new-row"></button>' +
            '</div>');

        this.grid = {
            _columnClicked: function () {
            },
            _newRowClicked: function () {
            },
            _valueChanged: function () {
            },
            _newRowChanged: function () {
            },
            _rowClicked: function () {
            },
            _validate: function () {
                return true;
            },
            _validateRow: function () {
            },
            _deleteRow: function () {

            }
        };
        this.listeners = gridListeners.call(this.grid, this.headerContainer,
            this.bodyContainer, this.footerContainer, {rows: {
                link: true
            }});
    });

    afterEach(function () {
        this.sandbox.restore();
        delete this.listeners;
        delete this.grid;
    });

    it('Should listen for a column being clicked', function () {
        var spy = this.sandbox.spy(this.grid, '_columnClicked');

        expect(spy.callCount).to.equal(0);

        this.headerContainer.find('th[data-col-id="col-a"]').trigger('click');

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('col-a');
    });

    it('Should listen for an new row click', function () {
        var spy = this.sandbox.spy(this.grid, '_newRowClicked'),
            validateSpy = this.sandbox.stub(this.grid, '_validateRow', function () {
                return true;
            });

        expect(spy.callCount).to.equal(0);
        expect(validateSpy.callCount).to.equal(0);

        this.footerContainer.find('button.new-row').trigger($.Event('mousedown', {which: 1}));

        expect(spy.callCount).to.equal(1);
        expect(validateSpy.callCount).to.equal(1);
        expect(validateSpy.args[0][0].attr('data-row-id')).to.equal('new-row');
    });

    it('Should listen for a change event on a new row item', function () {
        var spy = this.sandbox.spy(this.grid, '_newRowChanged'),
            spyValidate = this.sandbox.spy(this.grid, '_validate');

        expect(spy.callCount).to.equal(0);
        expect(spyValidate.callCount).to.equal(0);

        var input = this.footerContainer.find('input');
        input.val('b');
        input.trigger('change');

        expect(spy.callCount).to.equal(1);
        expect(spyValidate.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('col-a');

        var select = this.footerContainer.find('select');
        select.val('b').trigger('change');

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('col-b');
    });

    it('Should listen for a change event on an input', function () {
        var spy = this.sandbox.spy(this.grid, '_valueChanged');

        expect(spy.callCount).to.equal(0);

        // text input
        var input = this.bodyContainer.find('#input');
        input.val('b');
        input.trigger('change');

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('row-id');
        expect(spy.args[0][1]).to.equal('col-a');
        expect(spy.args[0][2]).to.equal('b');

        // select control
        var select = this.bodyContainer.find('select');
        select.val('b').trigger('change');

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('row-id');
        expect(spy.args[1][1]).to.equal('col-b');
        expect(spy.args[1][2]).to.equal('b');

        // checkbox input
        input = this.bodyContainer.find('#checkbox');
        input.prop('checked', true);
        input.trigger('change');

        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.equal('row-id');
        expect(spy.args[2][1]).to.equal('col-c');
        expect(spy.args[2][2]).to.equal(true);

        input.prop('checked', false);
        input.trigger('change');

        expect(spy.callCount).to.equal(4);
        expect(spy.args[3][0]).to.equal('row-id');
        expect(spy.args[3][1]).to.equal('col-c');
        expect(spy.args[3][2]).to.equal(false);

    });

    it('Should listen for a click event on a td', function () {
        var spy = this.sandbox.spy(this.grid, '_rowClicked');

        expect(spy.callCount).to.equal(0);

        var cell = this.bodyContainer.find('td').eq(0);
        cell.trigger('click');

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('row-id');
        expect(spy.args[0][1]).to.equal('col-a');
    });

    it('Should call inputBlur for a body input', function () {
        var spy = this.sandbox.spy(this.grid, '_validate');

        expect(spy.callCount).to.equal(0);

        var cell = this.bodyContainer.find('td').eq(0).find('input');
        cell.trigger('blur');

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('row-id');
        expect(spy.args[0][1]).to.equal('col-a');
        expect(spy.args[0][2].is('input')).to.be.true;
    });

    it('Should call delete row', function () {

        var spy = this.sandbox.spy(this.grid, '_deleteRow');

        expect(spy.callCount).to.equal(0);

        this.bodyContainer.find('.row-delete>button').trigger('click');

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('row-id');
    });
});
