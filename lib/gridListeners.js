var $ = require('jquery');

module.exports = function (headerContainer, bodyContainer, footerContainer, options) {

    var me = this;

    headerContainer.find('thead').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var el = $(e.target);

        if (el.is('th')) {
            me._columnClicked(el.attr('data-col-id'));
        }
    });

    // listen to mousedown instead of click due to conflicts with blur events
    footerContainer.find('button.new-row').on('mousedown', function (e) {
        var row = footerContainer.find('tr');
        if (e.which === 1 && me._validateRow(row)) {// left mouse button
            me._newRowClicked();
        }
    });

    footerContainer.on('change', function (e) {
        var target = $(e.target);

        if (target.is('input, select')) {
            var td = target.closest('td'),
                tr = td.closest('tr');

            var valid = true;
            if (target.is('input')) {
                valid = me._validate(tr.attr('data-row-id'), td.attr('data-col-id'), target);
            }

            if (valid) {
                me._newRowChanged(td.attr('data-col-id'));
            }
        }
    });

    bodyContainer.find('td input, td select').on('change', function (e) {
        var target = $(e.target),
            td = target.closest('td'),
            tr = target.closest('tr'),
            value = target.val();

        if (target.is('input') && target.attr('type') === 'checkbox') {
            value = target.prop('checked');
        }

        me._valueChanged(tr.attr('data-row-id'), td.attr('data-col-id'), value);
    });

    bodyContainer.find('td input').on('blur', function (e) {
        var input = $(e.target),
            td = input.closest('td'),
            tr = input.closest('tr');

        me._validate(tr.attr('data-row-id'), td.attr('data-col-id'), input);
    });

    bodyContainer.on('click', 'button', function (e) {
        var target = $(e.target),
            tr = target.closest('tr');

        if (target.parent().is('.row-delete')) {
            me._deleteRow(tr.attr('data-row-id'));
        }
    });

    if (options.rows.link) {
        bodyContainer.find('td').on('click', function (e) {
            var target = $(e.target),
                td = target.closest('td'),
                tr = target.closest('tr');

            if (!target.is('a')) {
                // if not a link then a row link
                me._rowClicked(tr.attr('data-row-id'), td.attr('data-col-id'));
            }
        });
    }


};