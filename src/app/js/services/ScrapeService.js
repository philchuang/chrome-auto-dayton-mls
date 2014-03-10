"use strict";

var scrapeServiceBase = scrapeServiceBase || {

};

var listingUtils = listingUtils || {};

listingUtils.comparisonProperties = ["listPrice", "sqft", "remarks", "numPics"];

listingUtils.getChanges = function (previous, latest) {
    if (typeof previous === "undefined"
        || typeof latest === "undefined"
        || previous == null
        || latest == null)
        return "";

    var result = "";

    for (var i = 0; i < listingUtils.comparisonProperties.length; i++) {
        var property = listingUtils.comparisonProperties[i];
        var previousVal = previous[property];
        var latestVal = latest[property];
        if (previousVal != latestVal)
            result += ", " + property + ": " + previousVal + " -> " + latestVal;
    }

    if (result.length > 2)
        result = result.substr (2);

    return result;
};

listingUtils.processChanges = function (previous, latest) {

    if (typeof previous === "undefined"
        || typeof latest === "undefined"
        || latest == null)
        return;

    if (typeof latest.history === "undefined")
        latest.history = [];

    if (previous === null) {
        latest.history.push ({
            timestamp: latest.timestamp,
            action: "started tracking"
        });
        return;
    }

    latest.history = previous.history;

    latest.history.push (listingUtils.getChanges (previous, latest));
};

app.service ('scrapeService', function (storageService) {

    return {

        processListing: function (listing) {
            // get previous listing
            storageService.getListing (listing.id).then (function (existingListing) {
                // compare listing
                listingUtils.processChanges (existingListing, listing);
                // save listing
                storageService.saveListing (listing);
            });
        }

        // TODO a way to mark stale listings

    };
});