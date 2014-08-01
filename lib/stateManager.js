var _ = require('underscore'),
    sorter = require('stand-in-order');

// values that are foo.bar
var getDeepValue = function (path, obj) {
    if (obj == null) {
        return null;
    }

    if (path == null) {
        return obj == null ? null : obj;
    }

    var split = path.split('.');

    var newValue = obj[split[0]];
    if (split.length === 1) {
        return newValue == null ? null : newValue;
    }
    split.shift();
    return getDeepValue(split.join('.'), newValue);
};

var setDeepValue = function (path, obj, value) {
    var split = path.split('.');
    if (split.length === 1) {
        obj[split[0]] = value;
        return;
    }
    var name = split[0];
    if (!_.has(obj, name)) {
        obj[name] = {};
    }
    split.shift();
    setDeepValue(split.join('.'), obj[name], value);
};

/**
 * State Manager constructor.
 * @constructor
 * @param data - Array
 * @param ears - Function
 * @param options - Object
 */
var stateManager = function (data, ears, options) {
    this._data = data;
    this._ears = ears;
    this._options = options;
    this._newRecordUniqueId = -1;
    this._deletedRecords = [];
};

stateManager.prototype = {

    constructor: stateManager,

    /**
     * Return deleted records.
     * Note - Does not include new records which are then deleted.
     * @returns Array
     */
    getDeletedRecords: function () {
        return this._deletedRecords;
    },

    /**
     * Return all records.
     * @returns Array
     */
    getRecords: function () {
        return this._data;
    },

    /**
     * Return a single record by a given id.
     * @param id - String
     * @returns Object
     */
    getRecord: function (id) {
        var condition = {};
        condition[this._options.id] = id;
        return _.findWhere(this.getRecords(), condition);
    },

    /**
     * Return a set of records by given set of key value pairs.
     * @param conditions - Object
     * @returns Array
     */
    findRecords: function (conditions) {
        return _.where(this.getRecords(), conditions || {});
    },

    /**
     * Return a property value from a value.
     * Note - 'name' can be deep path, eg foo.bar
     * @param record - Object
     * @param name - String
     */
    getRecordValue: function (record, name) {
        return getDeepValue(name, record);
    },

    /**
     * Set a value on record by a given property name.
     * Note - 'name' can be deep path, eg foo.bar
     * @param record - Object
     * @param name - String
     * @param value - Object | String | Boolean | Number | Integer
     * @event fires record-updated with
     *  {
     *      record: Object,
     *      recordId: String,
     *      propertyName: String,
     *      value: String | Number | Integer | Boolean | Object
     *  }
     */
    setRecordValue: function (record, name, value) {
        setDeepValue(name, record, value);
        this._ears.trigger('record-updated', {
            record: record,
            recordId: record[this._options.id],
            propertyName: name,
            value: value
        });
    },

    /**
     * Add a given record to the record set.
     * Note - Returns the record with a new id set.
     * @param record - Object
     * @param position - Integer - Optional
     * @event fires record-added with record: Object,
     * @return Object
     */
    addRecord: function (record, position) {
        if (record) {
            record[this._options.id] = this._newRecordUniqueId.toString();
            this._newRecordUniqueId--;
        }
        var records = this.getRecords();
        if (position == null) {
            position = records.length; // add to the end of the array
        }
        records.splice(position, 0, record);
        this._ears.trigger('record-added', record);
        return record;
    },

    /**
     * Delete a record by a given id.
     * @param id - String
     * @event fires record-deleted with record: Object,
     */
    deleteRecord: function (id) {
        var records = this.getRecords();
        var deleteRecord = this.getRecord(id);
        var record = records.splice(records.indexOf(deleteRecord), 1)[0];
        if (!this.getRecordAttributes(record).isNew) {
            // don't add a new record to the deleted list
            this.getDeletedRecords().push(record);
        }
        this._ears.trigger('record-deleted', deleteRecord);
    },

    /**
     * Return a given set of attributes determining the state of the record.
     * Attributes:
     * - areEditableValues: Array of property names that have editable values.
     * - isNew: Boolean determining whether the record is new.
     * - canDelete: Boolean determining whether the record can be deleted.
     * @returns Object
     */
    getRecordAttributes: function (record) {
        return {
            areEditableValues: [],
            isNew: parseInt(record[this._options.id]) < 0,
            canDelete: true
        };
    },

    /**
     * Loop around the records and call function on each record.
     * @param callback - Function
     * @param sortConfig - Array - Optional
     * @param sortConfig    [
     *                          {
     *                              type: 'string' || 'integer' || 'float' || 'boolean' || 'date,
     *                              ascending: true || false,
     *                              name: 'foo'     // property name in object
     *                          }
     *                      ]
     */
    iterator: function (callback, sortConfig) {
        var records = this.getRecords();

        if (sortConfig != null && _.isArray(sortConfig) && sortConfig.length) {
            records = records.slice(0);     // clone so core order is not affected
            sorter(records, sortConfig);    // sort the copied records
        }

        _.each(records, callback);
    }
};

module.exports = stateManager;
