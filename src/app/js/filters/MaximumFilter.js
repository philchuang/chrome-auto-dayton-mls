"use strict";

app.filter ("maximum", function () {
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
            var add = true;
            for (var propertyName in maxFilter) {
                if (maxFilter[propertyName] == "" || maxFilter[propertyName] == null) continue;
                if (typeof item[propertyName] === "undefined" || item[propertyName] > maxFilter[propertyName]) {
                    add = false;
                    break;
                }
            }
            if (add) filtered.push (item);
        }

        return filtered;
    };
});