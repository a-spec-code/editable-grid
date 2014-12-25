var $ = require('jquery'),
    Grid = require('../grid');

module.exports = {

    title: 'Virtual Table',

    description: '',

    present: function (el) {

        var tableContainer = $('<div id="table-1"/>'),
            tableContainer2 = $('<div id="table-2"/>'),
            addButton = $('<button>Add</button>'),
            deleteButton = $('<button>Delete</button>');
        el.append(addButton);
        el.append(deleteButton);
        el.append(tableContainer);
        el.append(tableContainer2);

        var columns = [];
        columns.push({
            name: 'id',
            title: 'Index',
            sortable: true,
            width: 50
        });
        for (var colNum = 1; colNum < 3; colNum++) {
            columns.push({
                name: 'col-' + colNum,
                title: 'Column - ' + colNum,
                width: '50px'
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
            el: tableContainer,
            columns: columns,
            data: records
        });
        grid.render();

        grid.on('booty.can-add', function (/*record*/) {
            return true;
        });

        grid.on('booty.can-delete', function (/*record*/) {
            return true;
        });

        addButton.on('click', function () {
            grid.add();
        });
        deleteButton.on('click', function () {
            grid.delete();
        });


        // grid 2
        var columns2 = [];
        columns2.push({
            name: 'id',
            title: 'col-1',
            sortable: true,
            width: 50
        });
        for (var colNum2 = 2; colNum2 <= 10; colNum2++) {
            columns2.push({
                name: 'col-' + colNum2,
                title: 'Col - ' + colNum2,
                width: 75
                //width: Math.ceil(Math.random() * (300 - 100) + 100) + 'px'
            });
        }
        var records2 = [];
        for (var r2 = 1; r2 <= 50; r2++) {
            var record2 = {
                id: r2.toString()
            };
            for (var c2 = 0; c2 <= columns2.length; c2++) {
                record2['col-' + c2] = Math.random().toString(36).substring(4);
            }
            records2.push(record2);
        }

        var grid2 = new Grid({
            el: tableContainer2,
            columns: columns2,
            data: records2
        });
        grid2.render();
    }

};
