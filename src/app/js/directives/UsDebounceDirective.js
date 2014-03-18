"use strict";

// underscore debounce
app.directive('usDebounce', function ($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 99,
        link: function (scope, element, attr, ngModelCtrl) {

            if (attr.type === 'radio' || attr.type === 'checkbox') {
                return;
            }

            var delayMs = parseInt (attr.usDebounce, 10);
            if (isNaN (delayMs)) {
                delayMs = 500;
            }

            element.unbind ("input");

            var debounce;
            element.bind ("input", function () {
                $timeout.cancel (debounce);
                debounce = $timeout (function () {
                    scope.$apply (function () {
                        ngModelCtrl.$setViewValue (element.val());
                    });
                }, delayMs);
            });
            element.bind ('blur', function () {
                scope.$apply (function () {
                    ngModelCtrl.$setViewValue (element.val ());
                });
            });
        }
    };
});