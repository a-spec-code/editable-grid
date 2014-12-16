var Grid = require('../grid');

module.exports = {

    title: 'Virtual Table',

    description: '',

    present: function (el) {
        var columns = [];
        columns.push({
            id: 'id',
            title: 'Index',
            sortable: true,
            width: 50
        });
        for (var colNum = 1; colNum < 2; colNum++) {
            columns.push({
                id: 'col-' + colNum,
                title: 'Column - ' + colNum,
                width: Math.ceil(Math.random() * (300 - 100) + 100) + 'px'
            });
        }
        var records = [];
        for (var r = 1; r <= 5; r++) {
            var record = {
                id: r.toString()
            };
            for (var c = 0; c < columns.length; c++) {
                record['col-' + c] = Math.random().toString(36).substring(4);
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
