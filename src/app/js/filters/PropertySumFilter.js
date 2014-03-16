"use strict";

app.filter ("propertySum", function () {
    return function (array, propertyName) {
        if (typeof array === "undefined" || array == null || array.length === 0) return 0;

        return array.reduce (function (a, b) {
            var aVal, bVal;
            if (typeof a === "number")
            {
                bVal = b[propertyName];
                if (typeof bVal === "undefined")
                    bVal = 0;
                return a + bVal;
            }

            aVal = a[propertyName];
            if (typeof aVal === "undefined")
                aVal = 0;
            bVal = b[propertyName];
            if (typeof bVal === "undefined")
                bVal = 0;
            return aVal + bVal;
        });
    };
});