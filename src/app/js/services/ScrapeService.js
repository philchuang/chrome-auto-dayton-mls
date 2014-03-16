"use strict";

var ScrapeServiceBase = ScrapeServiceBase || {
    stalenessThresholdMs: 1000 * 60 * 60 * 24 // 1 day in milliseconds
};

var ListingUtils = ListingUtils || {
    NO_CHANGE: 0,
    NEW_LISTING: -1,
    UPDATED_LISTING: 1,
};

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
    var propertyName = "pictures";
    return {
        propertyName: propertyName,
        getChanges: function (previous, latest) {
            var previousVal = previous[propertyName];
            var latestVal = latest[propertyName];

            // nonexistent, empty, null comparison
            if (typeof previousVal === "undefined" || previousVal === null) { 
                // previous is nonexistent or null
                // just means that we're populating this data for the first time
                return null;
            }

            // size comparison
            if (previousVal.length != latestVal.length)
                return propertyName + ": [" + previousVal.length + "] -> [" + latestVal.length + "]";

            // data comparison
            // bah, don't care about data comparison right now
            return null;
        }
    };
};

var roomsComparatorProvider = function () {
    var propertyName = "rooms";
    return {
        propertyName: propertyName,
        getChanges: function (previous, latest) {
            var previousVal = previous[propertyName];
            var latestVal = latest[propertyName];

            // nonexistent, empty, null comparison
            if (typeof previousVal === "undefined" || previousVal === null) { 
                // previous is nonexistent or null
                // just means that we're populating this data for the first time
                return null;
            }

            // size comparison
            if (previousVal.length != latestVal.length)
                return propertyName + ": [" + previousVal.length + "] -> [" + latestVal.length + "]";

            // data comparison
            // bah, don't care about data comparison right now
            return null;
        }
    };
};

ListingUtils.comparators = [
    simpleComparatorProvider ("listPrice"),
    simpleComparatorProvider ("sqft"),
    simpleComparatorProvider ("status"),
    simpleComparatorProvider ("description"),
    picturesComparatorProvider (),
    roomsComparatorProvider ()
];

ListingUtils.getChanges = function (previous, latest) {
    if (typeof previous === "undefined"
        || typeof latest === "undefined"
        || previous === null
        || latest === null)
        return null;

    var result = "";

    for (var i = 0; i < ListingUtils.comparators.length; i++) {
        var comparator = ListingUtils.comparators[i];
        var changes = comparator.getChanges (previous, latest);
        if (changes !== null)
            result += ", " + changes;
    }

    if (result.length === 0)
        return null;

    // removes initial ", "
    return result.substr (2);
};

ListingUtils.processChanges = function (previous, latest) {

    if (typeof latest === "undefined" || latest === null)
        return -2;

    if (typeof previous === "undefined" || previous === null)
    {
        latest.history = [];
        latest.history.push({
            timestamp: latest.timestamp,
            action: "started tracking"
        });
        return ListingUtils.NEW_LISTING;
    }
    
    // find values which don't exist in the previous object
    var newProperties = [];
    var propertyName;
    for (propertyName in latest) {
        if (typeof previous[propertyName] === "undefined") {
            newProperties.push (propertyName);
        }
    }

    // copy over values which don't exist in the latest object
    for (propertyName in previous)
        if (typeof latest[propertyName] === "undefined")
            latest[propertyName] = previous[propertyName];

    var changes = ListingUtils.getChanges (previous, latest);
    if (newProperties.length > 0) {
        var newPropertiesStr = "added " + newProperties.join (", ");
        if (changes === null)
            changes = newPropertiesStr;
        else
            changes = newPropertiesStr + ", " + changes;
    }
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
        },
        
        updateListing: function (listing) {
            if (typeof listing === "undefined" || listing === null
                || typeof listing.id === "undefined" || listing.id === null || listing.id === "") return;

            storageService.getListing (listing.id).then (function (existingListing) {
                if (typeof existingListing === "undefined" || existingListing === null) return;
                
                for (var propertyName in listing) {
                    if (propertyName === "id" || propertyName === "mls") continue;
                    existingListing[propertyName] = listing[propertyName];
                }

                storageService.saveListing (existingListing);
            });
        },
        
        checkNeedsListingDetails: function (mlsNums) {
            var deferred = $q.defer();

            storageService.getListings (mlsNums).then (function (listings) {
                var nums = [];
                
                if (typeof listings !== "undefined" && listings != null && listings.length > 0) {
                    for (var i = 0; i < listings.length; i++) {
                        if (typeof listings[i].listingDate === "undefined"
                            || listings[i].listingDate === null
                            || typeof listings[i].pictures === "undefined"
                            || listings[i].pictures === null
                            || listings[i].pictures.length === 0)
                            nums.push (listings[i].mls);
                    }
                }

                deferred.resolve (nums);
            });

            return deferred.promise;
        }
        
    };
});