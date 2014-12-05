var Editables = function () {
};

Editables.prototype = {

    constructor: Editables,

    text: function () {

        return {
            markup: '<input type="text"/>'
        };
    }

};

module.exports = Editables;
