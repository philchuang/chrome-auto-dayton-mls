"use strict";

app.directive ("clearControl", function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var input = element.prev().first();
            if (element[0].tagName === "A" || element[0].tagName === "a")
                element[0].href = "#"; // I hate this, prevent it from showing up in URL!
            element.bind ("click", function (e) {
                e.preventDefault = true;
                scope.$apply (function (s) {
                    input.val (""); // DAMMIT WHY DOES'NT THIS UPDATE FILTERING
                });
            });
        }
    };
});