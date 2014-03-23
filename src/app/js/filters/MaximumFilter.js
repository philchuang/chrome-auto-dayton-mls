"use strict";

app.filter ("maximum", function () {
    var compare = function (maxFilter, item) { return true; };
    compare = function (maxFilter, item) {
        for (var propertyName in maxFilter) {
            if (maxFilter[propertyName] == "" || maxFilter[propertyName] == null) continue;
            if (typeof item[propertyName] === "undefined")
                return false;
            if (typeof maxFilter[propertyName] === "object")
                return compare (maxFilter[propertyName], item[propertyName]);
            if (item[propertyName] > maxFilter[propertyName])
                return false;
        }
        return true;
    };

    return function (array, maxFilter) {
        if (!angular.isArray (array)) return array;

        var filtered = [];

        if (typeof maxFilter === "undefined" || maxFilter == null)
        {
            for (var i = 0; i < array.length; i++) {
                filtered.push (array[i]);
            }
            return filtered;
        }

        for (var i2 = 0; i2 < array.length; i2++) {
            var item = array[i2];
            if (compare (maxFilter, item)) filtered.push (item);
        }

        return filtered;
    };
});