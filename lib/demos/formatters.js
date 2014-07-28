var _ = require('underscore');

module.exports = {
    cost: function costFormatter(val, decimalplaces) {

        if (val == null) {
            return '';
        }

        if (!_.isNumber(val)) {
            return '';
        }

        if (decimalplaces == null) {
            decimalplaces = 2;
        }

        var isNegative = val < 0;

        if (isNegative) {
            // flip value to positive
            val = val * -1;
        }

        // format to a string to two decimal places
        var str = val.toFixed(decimalplaces);

        // split str by decimal place
        var split = str.split('.');

        // add commas
        var reverse = split[0].split('').reverse();
        for (var index = 3; index < reverse.length; index += 3) {
            reverse.splice(index, 0, ',');
            index++;
        }
        str = reverse.reverse().join('') + '.' + split[1];

        // add negative brackets
        if (isNegative) {
            str = '(' + str + ')';
        }

        return '$' + str;
    },

    percent: function (val) {
        if (val == null) {
            return '';
        }

        if (!_.isNumber(val) || val < 0 || val > 1) {
            return '';
        }
        return (val * 100).toFixed(0) + '%';
    }
};