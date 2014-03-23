"use strict";

app.filter ("minimum", function () {
    var compare = function (minFilter, item) { return true; };
    compare = function (minFilter, item) {
        for (var propertyName in minFilter) {
            if (minFilter[propertyName] == "" || minFilter[propertyName] == null) continue;
            if (typeof item[propertyName] === "undefined")
                return false;
            if (typeof minFilter[propertyName] === "object")
                return compare (minFilter[propertyName], item[propertyName]);
            if (item[propertyName] < minFilter[propertyName])
                return false;
        }
        return true;
    };

    return function (array, minFilter) {
        if (!angular.isArray (array)) return array;

        var filtered = [];

        if (typeof minFilter === "undefined" || minFilter == null)
        {
            for (var i = 0; i < array.length; i++) {
                filtered.push (array[i]);
            }
            return filtered;
        }

        for (var i2 = 0; i2 < array.length; i2++) {
            var item = array[i2];
            if (compare (minFilter, item)) filtered.push (item);
        }

        return filtered;
    };
});