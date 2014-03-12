"use strict";

app.controller ("ListingsController",
    function ($scope, storageService) {

        var refresh = function () {
            storageService.getAllListings().then(function (listings) {
                $scope.listings = listings;
            });
        };

        refresh ();

        $scope.refresh = refresh;

        $scope.initPrettyPhoto = function () {
            $ ("a[rel^='prettyPhoto']").prettyPhoto ({ social_tools: null });
        };

        $scope.deleteAllListings = function () {
            $scope.listings = [];
            storageService.clearAllListings();
        };

    });