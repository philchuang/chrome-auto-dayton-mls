"use strict";

var ListingsControllerBase = ListingsControllerBase || {};

// calculates values
ListingsControllerBase.prepareListing = ListingsControllerBase.prepareListing || function (listing) {
    if (!Utils.isDefinedAndNotNull (listing)) return;

    if (!Utils.isDefinedAndNotNull (listing.calculated))
        listing.calculated = {};

    listing.calculated.streetNameAndNumber = listing.record.streetName + " " + listing.record.streetNumber;
    listing.calculated.streetNumberAndName = listing.record.streetNumber + " " + listing.record.streetName;

    var semiAnnualTaxes = Utils.isDefinedAndNotNull (listing.record.semiAnnualTaxes) ? parseFloat (listing.record.semiAnnualTaxes) : 0;
    var hoaFee = Utils.isDefinedAndNotNull (listing.record.hoaFee) ? parseFloat (listing.record.hoaFee) : 0;
    var assessments = Utils.isDefinedAndNotNull (listing.record.assessments) ? parseFloat (listing.record.assessments) : 0;

    if (!isNaN (semiAnnualTaxes) || !isNaN (hoaFee))
        listing.calculated.annualTaxes = (!isNaN (semiAnnualTaxes) ? semiAnnualTaxes : 0) * 2 + (!isNaN (hoaFee) ? hoaFee : 0) + (!isNaN (assessments) ? assessments : 0);

    listing.calculated.lastUpdate = new Date (Math.max.apply (Math, listing.history.map (function (h) { return Date.parse (h.timestamp); })));
    if (Utils.isDefinedAndNotNull (listing.record.listingDate)
        && (listing.history.length == 1 || isNaN (listing.calculated.lastUpdate) || isNaN (listing.calculated.lastUpdate.getTime ()))) {
        listing.calculated.lastUpdate = new Date (Date.parse (listing.record.listingDate));
    }

    // use this instead of setting filter to rooms.length b/c undefined will not filter out
    listing.calculated.numRooms = listing.record.rooms ? listing.record.rooms.length : 0;
};

// removes calculated values
ListingsControllerBase.sanitizeListing = ListingsControllerBase.sanitizeListing || function (listing) {
    delete listing.calculated;
};

ListingsControllerBase.prepareListings = ListingsControllerBase.prepareListings || function (listings) {
    if (typeof listings === "undefined" || listings === null) return;
    for (var i = 0; i < listings.length; i++) {
        ListingsControllerBase.prepareListing (listings[i]);
    }
};

ListingsControllerBase.sanitizeListings = ListingsControllerBase.sanitizeListings || function (listings) {
    if (typeof listings === "undefined" || listings === null) return;
    for (var i = 0; i < listings.length; i++) {
        ListingsControllerBase.sanitizeListing (listings[i]);
    }
};

app.controller ("ListingsController",
    function ($scope, $q, $timeout, $modal, listingStorageService, storageService, notificationService, listingImportService) {

        $scope.refresh = function () {
            var deferred = $q.defer ();

            $scope.isRefreshing = true;
            $scope.filteredListings = null;
            $scope.listings = null;

            listingStorageService.getAllListings ().then (function (listings) {
                ListingsControllerBase.prepareListings (listings);
                $scope.listings = listings;
                $scope.isRefreshing = false;
                deferred.resolve();
            });

            return deferred.promise;
        };

        $scope.delete = function (listing) {
            if (typeof $scope.listings === "undefined" || $scope.listings === null || $scope.listings.length === 0)
                return;

            $modal.open({
                templateUrl: "ConfirmationDialog.html",
                controller: ModalInstanceCtrl,
                resolve: {
                    dataContext: function () {
                        return {
                            title: "Please confirm",
                            message: "Are you sure you want to delete listing for " + listing.calculated.streetNumberAndName + "?"
                        };
                    }
                }
            }).result.then (function (_) {
                var idx = $.inArray (listing, $scope.listings);
                if (~idx) $scope.listings.splice (idx, 1);
                listingStorageService.deleteListing (listing.id);
                notificationService.displayNotification ("", "Deleted listing", "Deleted " + listing.calculated.streetNumberAndName);
            });
        };

        $scope.deleteFilteredListings = function () {
            if (typeof $scope.filteredListings === "undefined" || $scope.filteredListings === null || $scope.filteredListings.length === 0)
                return;

            $modal.open ({
                templateUrl: "ConfirmationDialog.html",
                controller: ModalInstanceCtrl,
                resolve: {
                    dataContext: function () {
                        return {
                            title: "Please confirm",
                            message: "Are you sure you want to delete ALL these listings?"
                        };
                    }
                }
            }).result.then (function (_) {
                var listingsToDelete = $scope.filteredListings.filter (function (l) { return true; });
                for (var i = 0; i < listingsToDelete.length; i++) {
                    var listing = listingsToDelete[i];
                    var idx = $.inArray (listing, $scope.listings);
                    if (~idx) $scope.listings.splice (idx, 1);
                    listingStorageService.deleteListing (listing.id);
                }
                notificationService.displayNotification ("", "Deleted listings", listingsToDelete.length + " listings deleted.");
            });
        };

        $scope.saveListing = function (listing) {
            var copy = JSON.parse (JSON.stringify (listing));
            ListingsControllerBase.sanitizeListing (copy);
            listingStorageService.saveListing (copy);
        };

        $scope.toggleIsFavorite = function (listing) {
            listing.personal.isFavorite = !listing.personal.isFavorite;

            $scope.saveListing (listing);
        };

        $scope.toggleIsHidden = function (listing) {
            listing.personal.isHidden = !listing.personal.isHidden;

            $scope.saveListing (listing);
        };

        $scope.openRoomsDialog = function (listing) {
            $modal.open ({
                templateUrl: "RoomsDisplay.html",
                controller: ModalInstanceCtrl,
                resolve: {
                    dataContext: function () { return listing; }
                }
            });
        };
        
        $scope.exportListings = function () {
            var ids = $scope.filteredListings.map (function (l) { return l.id; });
            listingStorageService.getListings (ids).then (function (listings) {
                ListingsControllerBase.sanitizeListings (listings);
                var exportData = JSON.stringify (listings);
                $modal.open ({
                    templateUrl: "ExportDialog.html",
                    controller: ModalInstanceCtrl,
                    resolve: {
                        dataContext: function () {
                            return {
                                title: "Exported " + listings.length + " Listings",
                                json: exportData
                            };
                        }
                    }
                });
            });
        };

        $scope.importListings = function () {
            $modal.open ({
                templateUrl: "ImportDialog.html",
                controller: ModalInstanceCtrl,
                resolve: {
                    dataContext: function () {
                        return {
                            title: "Import Listings",
                            json: ""
                        };
                    }
                }
            }).result.then (function (scope) {
                var listings;
                try {
                    listings = JSON.parse (scope.dataContext.json);
                } catch (ex) {
                    notificationService.displayNotification ("", "Import error", "Error parsing JSON: " + ex.message);
                    return;
                }
                if (typeof listings === "undefined" || listings === null || listings.length === 0)
                    return;

                var numProcessed = 0;
                var numNew = 0;
                var numNoChange = 0;
                var numUpdated = 0;
                for (var i = 0; i < listings.length; i++) {
                    var listing = listings[i];
                    if (!Utils.isDefinedAndNotNull (listing)
                        || !Utils.isDefinedAndNotNull (listing.id)
                        || !Utils.isDefinedAndNotNull (listing.record.mls))
                        continue;
                    numProcessed++;
                    listingImportService.importListing (listing).then (function (resultAndListing) {
                        if (resultAndListing.result === -1)
                            numNew++;
                        else if (resultAndListing.result === 0)
                            numNoChange++;
                        else if (resultAndListing.result === 1)
                            numUpdated++;

                        if (numProcessed === numNew + numNoChange + numUpdated) {
                            var message = numProcessed + " processed: " + numNew + " new, " + numUpdated + " updated, " + numNoChange + " unchanged.";

                            notificationService.displayNotification ("", "Import Results", message);
                            $scope.refresh ();
                        }
                    });
                }
            });
        };

        $scope.loadFilters = function () {
            storageService.getLastListingsFilters ().then (function (filters) {
                if (filters) {
                    $scope.filters = filters;
                    $scope.tempDynamicJavascriptFilter = $scope.filters.dynamicJavascriptFilter;
                }
            });
        };

        $scope.saveFilters = function () {
            if ($scope.filters)
                storageService.saveLastListingsFilters ($scope.filters);
        };

        $scope.historySortProperty = "timestamp";
        $scope.historySortDescending = true;

        $scope.loadFilters ();
        $scope.refresh ();
    });

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
var ModalInstanceCtrl = function ($scope, $modalInstance, dataContext) {

    $scope.dataContext = dataContext;

    $scope.close = function () {
        $modalInstance.close ($scope);
    };
    
    $scope.cancel = function () {
        $modalInstance.dismiss ('cancel');
    };
};