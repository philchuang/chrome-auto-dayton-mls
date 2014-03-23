"use strict";

app.filter ("listingFilter", function ($filter) {
    return function (array, filterValues) {
        if (!angular.isArray (array)) return array;

        var filtered = [];

        if (typeof filterValues === "undefined" || filterValues === null) {
            for (var i = 0; i < array.length; i++)
                filtered.push (array[i]);
            return filtered;
        }

        for (var i2 = 0; i2 < array.length; i2++) {
            var test = array[i2];
            var testArray = [test];
            testArray = $filter ("filter") ([test.record], filterValues.record);
            if (testArray.length === 0) continue;
            testArray = $filter ("filter") ([test.personal], filterValues.personal);
            if (testArray.length === 0) continue;
            testArray = $filter ("filter") ([test.calculated], filterValues.calculated);
            if (testArray.length === 0) continue;
            filtered.push (test);
        }

        return filtered;
    };
});