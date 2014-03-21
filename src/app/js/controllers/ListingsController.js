"use strict";

var ListingsControllerBase = ListingsControllerBase || {};

// calculates values
ListingsControllerBase.prepareListing = ListingsControllerBase.prepareListing || function (listing) {
    if (typeof listing === "undefined" || listing === null) return;

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

    // use this instead of setting filter to rooms.length b/c undefined will not filter out
    listing.numRooms = listing.rooms ? listing.rooms.length : 0;
};

// removes calculated values
ListingsControllerBase.sanitizeListing = ListingsControllerBase.sanitizeListing || function (listing) {
    delete listing.streetNameAndNumber;
    delete listing.streetNumberAndName;
    delete listing.annualTaxes;
    delete listing.lastUpdate;
    delete listing.numRooms;
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
    function ($scope, $q, $timeout, $modal, listingStorageService, storageService, notificationService, scrapeService) {

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
                            message: "Are you sure you want to delete listing for " + listing.streetNumberAndName + "?"
                        };
                    }
                }
            }).result.then (function (_) {
                var idx = $.inArray (listing, $scope.listings);
                if (~idx) $scope.listings.splice (idx, 1);
                listingStorageService.deleteListing (listing.id);
                notificationService.displayNotification ("", "Deleted listing", "Deleted " + listing.streetNumberAndName);
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
            listing.isFavorite = !listing.isFavorite;

            $scope.saveListing (listing);
        };

        $scope.toggleIsHidden = function (listing) {
            listing.isHidden = !listing.isHidden;

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
                    notificationService.displayNotification("", "Import error", "Error parsing JSON: " + ex.message);
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
                    if (typeof listing === "undefined" || listing === null 
                        || typeof listing.id === "undefined" || listing.id === null
                        || typeof listing.mls === "undefined" || listing.mls === null)
                        continue;
                    numProcessed++;
                    // TODO convert to use a new importService
                    scrapeService.processListing (listing).then (function (resultAndListing) {
                        if (resultAndListing.result === -1)
                            numNew++;
                        else if (resultAndListing.result === 0)
                            numNoChange++;
                        else if (resultAndListing.result === 1)
                            numUpdated++;

                        if (numProcessed === numNew + numNoChange + numUpdated) {
                            var message = numProcessed + " processed: " + numNew + " new, " + numUpdated + " updated, " + numNoChange + " unchanged.";

                            notificationService.displayNotification ("", "Import Results", message);
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