"use strict";

app.filter ("dynamicJavascript", function () {
    return function (array, dynamicJs, scopeParameterName) {
        if (!angular.isArray(array)) return array;

        var filtered = [];
        for (var i = 0; i < array.length; i++) {
            filtered.push (array[i]);
        }

        if (typeof dynamicJs === "undefined" || dynamicJs == null || dynamicJs.length === 0) {
            return filtered;
        }

        /* custom filter to see if a listing has personal notes

        return !(listing === null || angular.isUndefined (listing.personalNotes) || listing.personalNotes.length === 0);

         */
        /* custom filter to see if a listing has a study

        if (listing == null || angular.isUndefined (listing.rooms) || listing.rooms.length === 0) return false;
        return listing.rooms.filter (function (r) { return r.name.match (new RegExp ("study", "i")) != null; }).length > 0;

         */

        /* custom filter to see if a listing has changed in price

        if (listing == null || angular.isUndefined (listing.history) || listing.history.length === 0) return false;
        return listing.history.filter (function (h) { return h.action.match (new RegExp ("listPrice:", "i")) != null; }).length > 0;

         */

        if (typeof scopeParameterName !== "string")
            scopeParameterName = "scope";

        var predicate = function (scope) { return true; };
        try {
            predicate = new Function (scopeParameterName, dynamicJs);
            predicate (null); // test to see if it crashes outright
        } catch (ex) {
            console.log ("error in dynamic javascript: " + ex.message);
            return filtered;
        }

        filtered.splice (0, filtered.length);

        var printedError = false;
        for (var i2 = 0; i2 < array.length; i2++)
        {
            var item = array[i2];
            try
            {
                if (predicate (item)) filtered.push (item);
            }
            catch (ex)
            {
                if (printedError === false) {
                    console.log("error in dynamic javascript: " + ex.message);
                    printedError = true;
                }
                continue;
            }
        }

        return filtered;
    };
});