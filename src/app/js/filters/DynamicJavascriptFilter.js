"use strict";

app.filter ("dynamicJavascript", function () {
    return function (array, dynamicJs) {
        if (!angular.isArray(array)) return array;

        var filtered = [];
        for (var i = 0; i < array.length; i++) {
            filtered.push (array[i]);
        }

        if (typeof dynamicJs === "undefined" || dynamicJs == null || dynamicJs.length === 0) {
            return filtered;
        }

        /* custom filter to see if a listing has a study

        if (scope == null || angular.isUndefined (scope.rooms) || scope.rooms.length === 0) return false;
        return scope.rooms.filter (function (r) { return r.name.match (new RegExp ("study", "i")) != null; }) != null;

         */

        var predicate = function (scope) { return true; };
        try {
            predicate = new Function("scope", dynamicJs);
            predicate (null); // test to see if it crashes outright
        }
        catch (ex) { return filtered; }

        filtered.splice (0, filtered.length);

        for (var i2 = 0; i2 < array.length; i2++) {
            var item = array[i2];
            try { if (predicate(item)) filtered.push(item); }
            catch (ex) { continue; }
        }

        return filtered;
    };
});