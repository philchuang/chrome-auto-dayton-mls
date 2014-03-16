"use strict";

var ListingsControllerBase = ListingsControllerBase || {};

ListingsControllerBase.prepareListing = function (listing) {
    if (typeof listing === "undefined" || listing === null) return;

    if (typeof listing.isFavorite === "undefined" || listing.isFavorite === null)
        listing.isFavorite = false;

    if (typeof listing.score === "undefined" || listing.score === null)
        listing.score = 0;

    listing.streetNameAndNumber = listing.streetName + " " + listing.streetNumber;
    listing.streetNumberAndName = listing.streetNumber + " " + listing.streetName;

    var semiAnnualTaxes = typeof listing.semiAnnualTaxes !== "undefined" ? parseFloat (listing.semiAnnualTaxes) : 0;
    var hoaFee = typeof listing.hoaFee !== "undefined" ? parseFloat (listing.hoaFee) : 0;
    var assessments = typeof listing.assessments !== "undefined" ? parseFloat (listing.assessments) : 0;

    if (!isNaN (semiAnnualTaxes) || !isNaN (hoaFee))
        listing.annualTaxes = (!isNaN (semiAnnualTaxes) ? semiAnnualTaxes : 0) * 2 + (!isNaN (hoaFee) ? hoaFee : 0) + (!isNaN (assessments) ? assessments : 0);

    listing.lastUpdate = new Date (Math.max.apply (Math, listing.history.map (function (h) { return Date.parse (h.timestamp); })));
    if (typeof listing.listingDate !== "undefined" && listing.listingDate !== null
        && (listing.history.length == 1 || isNaN (listing.lastUpdate) || isNaN (listing.lastUpdate.getTime()))) {
        listing.lastUpdate = new Date (Date.parse (listing.listingDate));
    }
};

//ListingsControllerBase.sanitizeListing = function (listing) {
//    if (typeof listing === "undefined" || listing === null) return;

//    delete listing.streetNameAndNumber;
//    delete listing.streetNumberAndName;

//    delete listing.annualTaxes;

//    delete listing.lastUpdate;
//};

ListingsControllerBase.prepareListings = function (listings) {
    if (typeof listings === "undefined" || listings === null) return;
    for (var i = 0; i < listings.length; i++) {
        ListingsControllerBase.prepareListing (listings[i]);
    }
};

app.controller ("ListingsController",
    function ($scope, $timeout, storageService) {

        var refresh = function () {
            storageService.getAllListings().then (function (listings) {
                ListingsControllerBase.prepareListings (listings);
                $scope.listingsSortAsc = true;
                $scope.listings = listings;
            });
        };

        refresh ();

        $scope.refresh = refresh;

        $scope.deleteAllListings = function () {
            alert('disabled until confirmation dialog is added');
            //$scope.listings = [];
            //storageService.clearAllListings();
        };

        $scope.delete = function (listing) {
            if (typeof $scope.listings === "undefined" || $scope.listings === null || $scope.listings.length === 0)
                return;

            alert('disabled until confirmation dialog is added');
            //var idx = $.inArray(listing, $scope.listings);
            //if (~idx) $scope.listings.splice(idx, 1);
            //storageService.deleteListing (listing.id);
        };

        $scope.saveListing = function (listing) {
            //ListingsControllerBase.sanitizeListing (listing);
            storageService.saveListing (listing).then (function () {
                //ListingsControllerBase.prepareListing (listing);
            });
        };

        $scope.toggleFavorite = function (listing) {
            listing.isFavorite = !listing.isFavorite;

            $scope.saveListing (listing);
        };

        $scope.historySortProperty = "timestamp";
        $scope.historySortDescending = true;

    });
