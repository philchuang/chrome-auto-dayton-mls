"use strict";

// executes the given method on the parent scope
app.directive ("initClearControls", function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $.each ($("." + attrs["initClearControls"]), function (idx, control) {
                var cc = $(control);
                if (control.tagName === "A"
                    || control.tagName === "a")
                    control.href = "";
                var input = cc.prev ().first ();
                cc.bind ("click", function (e) {
                    e.preventDefault = true;
                    // TODO WHY THE HECK ISN'T THIS UPDATING THE BINDING!
                    //input.val ("");
                    input.scope().$apply(function (s) {
                        input.val ("");
                    });
                });
            });
        }
    };
});