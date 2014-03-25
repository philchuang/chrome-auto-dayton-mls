"use strict";

app.directive ("imgLazyLoad", function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            // doesn't work right for the first few elements that are already in view when this is called
            element.lazyload ({
                effect: "fadeIn"
            });
        }
    };
});