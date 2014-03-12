"use strict";

app.filter ("minimum", function () {
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
            var add = true;
            for (var propertyName in minFilter) {
                if (minFilter[propertyName] == "" || minFilter[propertyName] == null) continue;
                if (typeof item[propertyName] === "undefined") continue;
                if (item[propertyName] < minFilter[propertyName]) {
                    add = false;
                    break;
                }
            }
            if (add) filtered.push (item);
        }

        return filtered;
    };
});