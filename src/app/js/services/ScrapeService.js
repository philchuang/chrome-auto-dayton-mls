"use strict";

var simpleComparatorProvider = function (propertyName) {
    return {
        propertyName: propertyName,
        getChanges: function (previous, latest) {
            var previousVal = previous[propertyName];
            var latestVal = latest[propertyName];
            if (previousVal != latestVal)
                return propertyName + ": " + previousVal + " -> " + latestVal;
            return null;
        }
    };
};

var picturesComparatorProvider = function () {
    return {
        getChanges: function (previous, latest) {
            var previousVal = previous.pictures;
            var latestVal = latest.pictures;

            // nonexistent, empty, null comparison
            if (!Utils.isDefinedAndNotNull (previousVal)) { 
                // previous is nonexistent or null
                // just means that we're populating this data for the first time
                return null;
            }

            // size comparison
            if (previousVal.length != latestVal.length)
                return "pictures: [" + previousVal.length + "] -> [" + latestVal.length + "]";

            // data comparison
            // bah, don't care about data comparison right now
            return null;
        }
    };
};

var roomsComparatorProvider = function () {
    return {
        getChanges: function (previous, latest) {
            var previousVal = previous.rooms;
            var latestVal = latest.rooms;

            // nonexistent, empty, null comparison
            if (!Utils.isDefinedAndNotNull (previousVal)) { 
                // previous is nonexistent or null
                // just means that we're populating this data for the first time
                return null;
            }

            // size comparison
            if (previousVal.length != latestVal.length)
                return "rooms: [" + previousVal.length + "] -> [" + latestVal.length + "]";

            // data comparison
            // bah, don't care about data comparison right now
            return null;
        }
    };
};

var ScrapeServiceBase = ScrapeServiceBase || {
    stalenessThresholdMs: 1000 * 60 * 60 * 24, // 1 day in milliseconds

    NO_CHANGE: 0,
    NEW_LISTING: -1,
    INVALID_OPERATION: -2,
    UPDATED_LISTING: 1,
    comparators: [
        simpleComparatorProvider ("listPrice"),
        simpleComparatorProvider ("sqft"),
        simpleComparatorProvider ("status"),
        simpleComparatorProvider ("description"),
        picturesComparatorProvider (),
        roomsComparatorProvider ()
    ]
};

ScrapeServiceBase.getChanges = ScrapeServiceBase.getChanges || function (previous, latest) {
    if (!Utils.isDefinedAndNotNull (previous)
        || !Utils.isDefinedAndNotNull (latest))
        return null;

    var result = "";

    for (var i = 0; i < ScrapeServiceBase.comparators.length; i++)
    {
        var comparator = ScrapeServiceBase.comparators[i];
        var changes = comparator.getChanges (previous.record, latest.record);
        if (changes !== null)
            result += ", " + changes;
    }

    if (result.length === 0)
        return null;

    // removes initial ", "
    return result.substr (2);
};

ScrapeServiceBase.processChanges = ScrapeServiceBase.processChanges || function (previous, latest) {

    if (!Utils.isDefinedAndNotNull (latest))
        return ScrapeServiceBase.INVALID_OPERATION;

    if (!Utils.isDefinedAndNotNull (previous))
    {
        latest.history = [];
        latest.history.push ({
            timestamp: latest.record.refreshed,
            action: "started tracking"
        });
        return ScrapeServiceBase.NEW_LISTING;
    }

    // find values which don't exist in the previous object
    var newProperties = [];
    var propertyName;

    if (Utils.isDefinedAndNotNull (latest.record)) {
        for (propertyName in latest.record) {
            if (!Utils.isDefinedAndNotNull (previous.record) || typeof previous.record[propertyName] === "undefined") {
                newProperties.push (propertyName);
            }
        }
    }

    // ensure record obj is present
    if (!Utils.isDefinedAndNotNull (previous.record))
        previous.record = {};

    if (!Utils.isDefinedAndNotNull (latest.record))
        latest.record = {};

    // copy over values which don't exist in the latest object
    for (propertyName in previous)
        if (typeof latest[propertyName] === "undefined")
            latest[propertyName] = previous[propertyName];
    if (Utils.isDefinedAndNotNull (previous.record)) {
        for (propertyName in previous.record) {
            if (typeof latest.record[propertyName] === "undefined")
                latest.record[propertyName] = previous.record[propertyName];
        }
    }

    var changes = ScrapeServiceBase.getChanges (previous, latest);
    // don't care to see this change right now
    //if (newProperties.length > 0) {
    //    var newPropertiesStr = "added " + newProperties.join (", ");
    //    if (changes === null)
    //        changes = newPropertiesStr;
    //    else
    //        changes = newPropertiesStr + ", " + changes;
    //}
    if (changes !== null) {
        latest.history.push ({ action: changes, timestamp: latest.record.refreshed });
        return ScrapeServiceBase.UPDATED_LISTING;
    }

    return ScrapeServiceBase.NO_CHANGE;
};

/*
 * processes scraped listing data and merges into the existing data
 */
app.factory ("scrapeService", function ($q, browserListingStorageService) {

    return {

        processListing: function (listing) {
            var deferred = $q.defer ();
            
            // get previous listing
            browserListingStorageService.getListing (listing.id).then (function (existingListing) {
                // compare listing
                var result = ScrapeServiceBase.processChanges (existingListing, listing);
                // save listing
                browserListingStorageService.saveListing (listing);
                deferred.resolve ({ result: result, listing: listing });
            });

            return deferred.promise;
        },

        updateListingStaleness: function () {
            browserListingStorageService.getAllListings ().then (function (listings) {
                var stalenessThreshold = new Date (new Date ().valueOf () - ScrapeServiceBase.stalenessThresholdMs);
                for (var i = 0; i < listings.length; i++) {
                    listings[i].record.isStale = new Date (listings[i].record.refreshed) < stalenessThreshold;
                    browserListingStorageService.saveListing (listings[i]);
                }
            });
        },
        
        checkNeedsListingDetails: function (mlsNums) {
            var deferred = $q.defer ();

            browserListingStorageService.getListings (mlsNums).then (function (listings) {
                var nums = [];
                
                if (Utils.isDefinedAndNotNull (listings) && listings.length > 0) {
                    for (var i = 0; i < listings.length; i++) {
                        if (!Utils.isDefinedAndNotNull (listings[i].record.listingDate)
                            || !Utils.isDefinedAndNotNull (listings[i].record.pictures)
                            || listings[i].record.pictures.length === 0
                            || !Utils.isDefinedAndNotNull (listings[i].record.rooms)
                            || listings[i].record.rooms.length === 0)
                            nums.push (listings[i].record.mls);
                    }
                }

                deferred.resolve (nums);
            });

            return deferred.promise;
        }
        
    };
});