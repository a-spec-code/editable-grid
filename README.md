booty-grid
==========

[![Build Status](https://travis-ci.org/skinnybrit51/booty-grid.svg?branch=master)](https://travis-ci.org/skinnybrit51/booty-grid)
[![NPM version](https://badge.fury.io/js/booty-grid.svg)](http://badge.fury.io/js/booty-grid)

#### Description

Bootstrap table with CRUD functionality.
##### [View Demos with Implementation Code](http://skinnybrit51.com/booty-grid "Demos")

Sorting
![](http://skinnybrit51.com/images/booty-grid.png)
Ability to add new rows.
![](http://skinnybrit51.com/images/booty-grid-new-row.png)
Ability to edit cells.
![](http://skinnybrit51.com/images/booty-grid-editable-cells.png)
Ability to delete rows.
![](http://skinnybrit51.com/images/booty-grid-delete-row.png)
Row Selection
![](http://skinnybrit51.com/images/booty-grid-row-selection.png)

#### Features

* Table based on [twitter bootstrap](http://getbootstrap.com/) classes
* Column Sorting
* Cell Links
* Text Alignment
* Row Selection
* Row Addition
* Row Deletion
* Total Column Row
* Editable Cells
* Checkbox column
* Formatting, parsing and validation on each column

#### Enhancements

I would love to hear what features you would like to see implemented.  Please raise them through github [issues](https://github.com/skinnybrit51/booty-grid/issues).  Thanks

#### Installation

````npm install booty-grid````

and import grid.less file into your own less file from  ````node_modules/booty-grid/less/grid.less```` 

or

Standalone version can be downloaded from the below links

* [Javascript (window global variable is "BootyGrid")](http://skinnybrit51.com/booty-grid/dist/booty_grid.min.js)
* [CSS](http://skinnybrit51.com/booty-grid/dist/booty_grid.min.css)

#### Using

````
var Grid = require('booty-grid'),
    datepicker = require('booty-datepicker'),
    $ = require('jquery');
    
// initialize datepicker - only required once per page
datepicker();                                           

var grid = new Grid({
    // event namespace name, will prefix booty.
    eventNamespace: 'booty',
    // property name for the id of the record
    recordIdName: 'id',                                           
    rows: {
        // turn to true for clickable rows
        link: false,
        // turn to true for an add row to appear in footer
        newRow: false,
        // turn to true to see an total row appear (only applicable to cost columns)                                          
        totalRow: false                                 
    },
    // pre sort the grid when rendered
    sortConfig: [                                       
        {
            id: 'col1',
            asc: true
        }
    ],
    // append custom event handlers
    addListeners: function(el) {},
    // return true to make a cell editable                          
    stateManager: {                                     
        isEditable: function(rowId, colId) {
            return false;
        }
    },
    // element to append grid too
    el: $('body'),                                      
    columns: [
        {
            // unique id for the data property name, can be nested - EG foo.bar
            id: 'col1',
            // title to be used in header column
            title: 'Column A',
            // width of column - must be in percentage form                           
            width: '100%',
            // can the value not have a value, only applies to editable values
            nullable: false,
            // format the value
            formatter: function(id, value) {            
                return value;
            },
            // parse the value, only applies to editable values            
            parser: function(id, value) {               
                return value;
            },
            // return an error message when a value is not valid
            // only applies to editable values
            validate: function(id, value) {             
                return '';  // value valid
            },
            // 'left' (default), 'center', 'right'
            alignment: 'left',
            // can the column be sorted                          
            sortable: false,
            // type of data in the column, 
            // options are 'text', 'cost', 'percent', 'select', 'date', 'checkbox'
            type: 'text',                               
            // values for a select type column, 
            // use formatter to format to the selected value            
            list: ['a', 'b', 'c'],                      
            // advanced functionality - see demos for example
            preCreateCallback: function() {             
                // called before cell is created
                // return cell value
            }
        }
    ],
    // data to be rendered to grid
    data: [                                             
        {
            id: 'id',
            col1: 'Hello World'
        }
    ]
});

// render the grid onto the page
grid.render();      

// things to listen for
grid.on('record-added', function(record) {});
grid.on('record-deleted', function(record) {});
grid.on('record-updated', function({record, recordId, propertyName, value}) {});

grid.on('booty-new-row-value-changed', function(newObj, colId) {});
grid.on('booty-row-clicked', function(params) {});


// things to trigger
grid.trigger('booty-delete-mode', true/false);

````

