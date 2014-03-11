"use strict";

// TODO move to another file
app.directive ("myRepeatFinished", function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope[attrs.myRepeatFinished]();
            }
        }
    };
});

app.controller ("ListingsController",
    function ($scope, storageService) {

        var refresh = function () {
            storageService.getAllListings().then (function (listings) {
                $scope.listings = listings;
            });
        };

        refresh ();

        $scope.refresh = refresh;

        $scope.initPrettyPhoto = function () {
            $ ("a[rel^='prettyPhoto']").prettyPhoto ({ social_tools: null });
        };

    });