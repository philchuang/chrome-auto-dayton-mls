"use strict";

var ListingImportServiceBase = ListingImportServiceBase || {
    NO_CHANGE: 0,
    NEW_LISTING: -1,
    INVALID_OPERATION: -2,
    UPDATED_LISTING: 1,
};

ListingImportServiceBase.copySourceIfTargetUndefined = function (source, target) {
    var modified = false;
    // copy over source values which don't exist in the target
    for (var propertyName in source) {
        if (typeof target[propertyName] === "undefined") {
            target[propertyName] = source[propertyName];
            modified = true;
        }
    }
    return modified;
};

ListingImportServiceBase.importListing = ListingImportServiceBase.importListing || function (previous, latest) {

    if (!Utils.isDefinedAndNotNull (latest))
        return ListingImportServiceBase.INVALID_OPERATION;

    if (!Utils.isDefinedAndNotNull (previous))
        return ListingImportServiceBase.NEW_LISTING;

    var updated = false;

    // find values which don't exist in the previous object
    var propertyName;
    for (propertyName in latest) {
        if (typeof previous[propertyName] === "undefined") {
            updated = true;
            break;
        }
    }
    
    // determine which MLS record to use
    if (Utils.isDefinedAndNotNull (previous.record)) {
        if (!Utils.isDefinedAndNotNull (latest.record)
            || (Date.parse (latest.record.refreshed) < Date.parse (previous.record.refreshed)))
            latest.record = previous.record;
        else {
            ListingImportServiceBase.copySourceIfTargetUndefined (previous.record, latest.record);
            updated = true;
        }
    }
    
    // determine which personal data to use
    if (Utils.isDefinedAndNotNull (previous.personal)) {
        if (!Utils.isDefinedAndNotNull (latest.personal))
            latest.personal = previous.personal;
        else {
            ListingImportServiceBase.copySourceIfTargetUndefined (previous.personal, latest.personal);
            updated = true;
        }
    }
    
    // merge histories
    if (Utils.isDefinedAndNotNull (previous.history)) {
        if (!Utils.isDefinedAndNotNull (latest.history))
            latest.history = previous.history;
        else {
            for (var i = 0; i < previous.history.length; i++) {
                var h = previous.history[i];
                if (latest.history.filter (function (h2) { return h2.timestamp === h.timestamp && h2.action === h.action; }).length === 0)
                    latest.history.push (h);
            }
            latest.history.sort (function (a, b) {
                if (a.timestamp > b.timestamp)
                    return 1;
                if (a.timestamp < b.timestamp)
                    return -1;
                return 0;
            });
            updated = true;
        }
    }

    // copy over values which don't exist in the latest object
    updated = ListingImportServiceBase.copySourceIfTargetUndefined (previous, latest) || updated;

    return updated ? ListingImportServiceBase.UPDATED_LISTING : ListingImportServiceBase.NO_CHANGE;
};

/*
 * imports listing data and merges into the existing data
 */
app.factory ("listingImportService", function ($q, browserListingStorageService) {

    return {

        importListing: function (listing) {
            var deferred = $q.defer ();
            
            // get previous listing
            browserListingStorageService.getListing (listing.id).then (function (existingListing) {
                // compare listing
                var result = ListingImportServiceBase.importListing (existingListing, listing);
                // save listing
                browserListingStorageService.saveListing (listing);
                deferred.resolve ({ result: result, listing: listing });
            });

            return deferred.promise;
        }
        
    };
});