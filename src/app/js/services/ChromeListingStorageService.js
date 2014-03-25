"use strict";

/*
 * handles persistence of listings, using Chrome API
 */
app.factory ("browserListingStorageService", function ($q, listingConformerService) {

    var getListingKey = function (id) {
        return "listing_" + id;
    };

    var saveListing = function (listing) {
        var deferred = $q.defer ();

        //if (!Utils.isDefinedAndNotNull (listing))
        // FUTURE throw exception if listing is undefined or null

        listingConformerService.conform (listing);

        var key = getListingKey (listing.id);
        var items = {};
        items[key] = listing;

        chrome.storage.local.set (items, function () {
            var error = chrome.runtime.lastError;
            if (typeof error !== "undefined") {
                console.log ("Error saving " + key + ": " + error);
                deferred.error (error);
            } else {
                deferred.resolve ();
            }
        });

        return deferred.promise;
    };
    
    var getListing = function (id) {
        var deferred = $q.defer();

        if (typeof id === "undefined")
        {
            deferred.resolve (null);
            return deferred.promise;
        }

        var key = getListingKey (id);

        chrome.storage.local.get (key, function (items) {
            var data = items[key];
            if (listingConformerService.conform (data))
                saveListing (data);
            deferred.resolve (data);
        });

        return deferred.promise;
    };
    
    /* FUTURE live-update thoughts...
     * getAllListings renamed loadAllListings which gets saved locally, getAllListings returns that value
     * saveListing replaces local copy
     */

    return {

        getAllListings: function () {
            var deferred = $q.defer();

            var keyPrefix = getListingKey ("");

            chrome.storage.local.get (null, function (items) {
                var listings = [];
                for (var propertyName in items) {
                    if (!S(propertyName).startsWith (keyPrefix)) continue;
                    if (listingConformerService.conform (items[propertyName]))
                        saveListing (items[propertyName]);
                    listings.push (items[propertyName]);
                }
                deferred.resolve (listings);
            });

            return deferred.promise;
        },
        
        getListings: function (ids) {
            var deferred = $q.defer();

            if (!Utils.isDefinedAndNotNull (ids) || ids.length === 0)
            {
                deferred.resolve ([]);
                return deferred.promise;
            }

            var storageIds = ids.map (function (id) { return getListingKey (id); });

            chrome.storage.local.get (storageIds, function (items) {
                var listings = [];
                for (var propertyName in items) {
                    if (listingConformerService.conform (items[propertyName]))
                        saveListing (items[propertyName]);
                    listings.push (items[propertyName]);
                }
                deferred.resolve (listings);
            });

            return deferred.promise;
        },
        
        getListing: getListing,

        saveListing: saveListing,
        
        deleteListing: function (id) {
            var key = getListingKey (id);
            chrome.storage.local.remove (key);
        }

        //clearAllListings: function () {
        //    var keyPrefix = getListingKey ("");

        //    chrome.storage.local.get (null, function (items) {
        //        var listingKeys = [];
        //        for (var propertyName in items) {
        //            if (!S(propertyName).startsWith (keyPrefix)) continue;
        //            listingKeys.push (propertyName);
        //        }

        //        chrome.storage.local.remove (listingKeys);
        //    });
        //}
    };
});