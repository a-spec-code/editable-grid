var Grid = require('../grid');

module.exports = {

    title: 'Virtual Table',

    description: '',

    present: function (el) {
        var columns = [];
        columns.push({
            id: 'id',
            title: 'Index',
            width: 50
        });
        for (var c = 1; c < 100; c++) {
            columns.push({
                id: 'col-' + c,
                title: 'Column - ' + c,
                width: Math.ceil(Math.random() * (300 - 100) + 100) + 'px'
            });
        }
        var records = [];
        for (var r = 1; r <= 50; r++) {
            var record = {
                id: r.toString()
            };
            for (var c = 0; c < columns.length; c++) {
                record['col-' + c] = Math.random().toString(36).substring(4)
            }
            records.push(record);
        }

        var grid = new Grid({
            el: el,
            columns: columns,
            data: records
        });
        grid.render();
    }

};
