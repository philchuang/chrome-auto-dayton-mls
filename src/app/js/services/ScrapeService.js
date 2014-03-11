"use strict";

var ScrapeServiceBase = ScrapeServiceBase || {
    stalenessThresholdMs: 1000 * 60 * 60 * 24 // 1 day in milliseconds
};

var ListingUtils = ListingUtils || {
    NO_CHANGE: 0,
    NEW_LISTING: -1,
    UPDATED_LISTING: 1,
};

ListingUtils.comparisonProperties = ["listPrice", "sqft", "remarks", "numPics"];

ListingUtils.getChanges = function (previous, latest) {
    if (typeof previous === "undefined"
        || typeof latest === "undefined"
        || previous === null
        || latest === null)
        return null;

    var result = "";

    for (var i = 0; i < ListingUtils.comparisonProperties.length; i++) {
        var property = ListingUtils.comparisonProperties[i];
        var previousVal = previous[property];
        var latestVal = latest[property];
        if (previousVal != latestVal)
            result += ", " + property + ": " + previousVal + " -> " + latestVal;
    }

    if (result.length === 0)
        return null;

    return result.substr (2);
};

ListingUtils.processChanges = function (previous, latest) {

    if (typeof latest === "undefined" || latest === null)
        return -2;

    if (typeof latest.history === "undefined")
        latest.history = [];

    if (typeof previous === "undefined" || previous === null)
    {
        latest.history.push ({
            timestamp: latest.timestamp,
            action: "started tracking"
        });
        return ListingUtils.NEW_LISTING;
    }

    latest.history = previous.history;
    var changes = ListingUtils.getChanges (previous, latest);
    if (changes !== null) {
        latest.history.push ({ action: changes, timestamp: latest.timestamp });
        return ListingUtils.UPDATED_LISTING;
    }

    return ListingUtils.NO_CHANGE;
};

app.service ("scrapeService", function ($q, storageService) {
    var getAllListings = function () {
        var deferred = $q.defer ();

        storageService.getAllListings ().then (function (listings) {
            deferred.resolve (listings);
        });

        return deferred.promise;
    };

    return {

        processListing: function (listing) {
            var deferred = $q.defer();
            
            // get previous listing
            storageService.getListing (listing.id).then (function (existingListing) {
                // compare listing
                var result = ListingUtils.processChanges (existingListing, listing);
                // save listing
                storageService.saveListing (listing);
                deferred.resolve (result);
            });

            return deferred.promise;
        },

        getAllListings: getAllListings,
        
        updateListingStaleness: function () {
            getAllListings ().then (function (listings) {
                var stalenessThreshold = new Date (new Date ().valueOf () - ScrapeServiceBase.stalenessThresholdMs);
                for (var i = 0; i < listings.length; i++) {
                    listings[i].isStale = new Date (listings[i].timestamp) < stalenessThreshold;
                    storageService.saveListing (listings[i]);
                }
            });
        }

    };
});