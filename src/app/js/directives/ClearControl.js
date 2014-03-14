"use strict";

// executes the given method on the parent scope
app.directive ("clearControl", function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var input = element.prev().first();
            if (element[0].tagName === "A" || element[0].tagName === "a")
                element[0].href = "";
            element.bind ("click", function (e) {
                e.preventDefault = true;
                input.val ("");
            });
        }
    };
});