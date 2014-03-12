"use strict";

// executes the given method on the parent scope
app.directive("repeatFinished", function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (scope.$last)
            {
                scope.$parent[attrs.repeatFinished]();
            }
        }
    };
});