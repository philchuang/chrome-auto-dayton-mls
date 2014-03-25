"use strict";

app.directive ("clearControl", function () {
    // this is not a best practice
    // look into http://plnkr.co/edit/KqMIAC6MKPAVrA6LUY87?p=preview
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var input = element.prev ().first ();
            if (element[0].tagName === "A" || element[0].tagName === "a")
                element[0].href = "#"; // I hate this, prevent it from showing up in URL!
            element.bind ("click", function (e) {
                e.preventDefault = true;
                input.val ("");
                if (input[0].nodeName === "SELECT")
                    input.trigger ("change");
                else
                    input.trigger ("input");
            });
        }
    };
});