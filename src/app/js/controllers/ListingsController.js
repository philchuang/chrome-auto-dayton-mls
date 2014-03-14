"use strict";

var ListingsControllerBase = ListingsControllerBase || {};

ListingsControllerBase.prepareListing = function (listing) {
    if (typeof listing === "undefined" || listing === null) return;

    listing.streetNameAndNumber = listing.streetName + " " + listing.streetNumber;
    listing.streetNumberAndName = listing.streetNumber + " " + listing.streetName;

    var semiAnnualTaxes = typeof listing.semiAnnualTaxes !== "undefined" ? parseFloat (listing.semiAnnualTaxes) : 0;
    var hoaFee = typeof listing.hoaFee !== "undefined" ? parseFloat (listing.hoaFee) : 0;

    if (!isNaN (semiAnnualTaxes) || !isNaN (hoaFee))
        listing.annualTaxes = (!isNaN (semiAnnualTaxes) ? semiAnnualTaxes : 0) * 2 + (!isNaN (hoaFee) ? hoaFee : 0);

    listing.lastUpdate = new Date (Math.max.apply (Math, listing.history.map (function (h) { return Date.parse (h.timestamp); })));
    if (typeof listing.listingDate !== "undefined" && listing.listingDate !== null
        && (listing.history.length == 1 || isNaN (listing.lastUpdate) || isNaN (listing.lastUpdate.getTime()))) {
        listing.lastUpdate = new Date (Date.parse (listing.listingDate));
    }
};

ListingsControllerBase.prepareListings = function (listings) {
    if (typeof listings === "undefined" || listings === null) return;
    for (var i = 0; i < listings.length; i++) {
        ListingsControllerBase.prepareListing (listings[i]);
    }
};

app.controller ("ListingsController",
    function ($scope, $timeout, storageService) {

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

        $scope.initLazyLoad = function () {
            if (~$scope.initLazyLoadExecuted)
                $timeout (function () {
                    $("img.lazy").lazyload ({
                        effect: "fadeIn"
                    });
                    $scope.initLazyLoadExecuted = true;
                }, 100);
        };
        
        //var initClearControls = function () {
        //    $.each ($(".clear-control"), function (idx, control) {
        //        var cc = $(control);
        //        if (control.tagName === "a")
        //            control.href = "javascript:return false;";
        //        var input = cc.prev ().first ();
        //        cc.click (function (e) {
        //            e.preventDefault = true;
        //            $scope.$apply (function () { input.val (""); });
        //        });
        //    });
        //};

        //$scope.$on ('$viewContentLoaded', initClearControls);

    });
