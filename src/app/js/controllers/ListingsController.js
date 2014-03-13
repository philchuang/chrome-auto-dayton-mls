"use strict";

var ListingsControllerBase = ListingsControllerBase || {};

ListingsControllerBase.prepareListing = function (listing) {
    if (typeof listing === "undefined" || listing === null) return;
    listing.streetNameAndNumber = listing.streetName + " " + listing.streetNumber;
    if (typeof listing.semiAnnualTaxes !== "undefined") {
        if (typeof listing.hoaFee === "undefined") listing.hoaFee = 0;
        listing.annualTaxes = parseInt (listing.semiAnnualTaxes) + parseInt (listing.hoaFee);
    }
    listing.lastUpdate = Math.max.apply (Math, listing.history.map (function (h) { return h.timestamp; }));
};

ListingsControllerBase.prepareListings = function (listings) {
    if (typeof listings === "undefined" || listings === null) return;
    for (var i = 0; i < listings.length; i++) {
        ListingsControllerBase.prepareListing (listings[i]);
    }
};

app.controller ("ListingsController",
    function ($scope, storageService) {

        var refresh = function () {
            storageService.getAllListings().then(function (listings) {
                ListingsControllerBase.prepareListings(listings);
                $scope.listingsSortAsc = true;
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