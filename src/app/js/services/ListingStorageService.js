"use strict";

app.service ("listingStorageService", function ($q) {

    var getListingKey = function (tabId) {
        return "listing_" + tabId;
    };
    
    // function used to clean up the listing object
    var fixListing = function (listing) {
        var modified = false;

        if (typeof listing === "undefined" || listing === null) return modified;

        // make sure user data is present
        if (typeof listing.isFavorite === "undefined" || listing.isFavorite === null)
            listing.isFavorite = false;

        if (typeof listing.isHidden === "undefined" || listing.isHidden === null)
            listing.isHidden = false;

        if (typeof listing.score === "undefined" || listing.score === null)
            listing.score = 0;

        if (typeof listing.subdivision === "undefined")
            listing.subdivision = "";


        // delete $$hashKey (gets added somehow)

        if (typeof listing.history !== "undefined" && listing.history !== null)
        {
            for (var i = 0; i < listing.history.length; i++) {
                if (typeof listing.history[i].$$hashKey !== "undefined") {
                    delete listing.history[i].$$hashKey;
                    modified = true;
                }
            }
        }

        if (typeof listing.pictures !== "undefined" && listing.pictures !== null)
        {
            for (var i2 = 0; i2 < listing.pictures.length; i2++) {
                if (typeof listing.pictures[i2].$$hashKey !== "undefined") {
                    delete listing.pictures[i2].$$hashKey;
                    modified = true;
                }
            }
        }

        return modified;
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
            if (fixListing (data))
                saveListing (data);
            deferred.resolve (data);
        });

        return deferred.promise;
    };

    var saveListing = function (listing) {
        var deferred = $q.defer ();

        fixListing (listing);

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
    
    /* TODO live-update thoughts...
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
                    if (fixListing (items[propertyName]))
                        saveListing (items[propertyName]);
                    listings.push (items[propertyName]);
                }
                deferred.resolve (listings);
            });

            return deferred.promise;
        },
        
        getListings: function (ids) {
            var deferred = $q.defer();

            if (typeof ids === "undefined" || ids == null || ids.length === 0)
            {
                deferred.resolve ([]);
                return deferred.promise;
            }

            var storageIds = ids.map (function (id) { return getListingKey (id); });

            chrome.storage.local.get (storageIds, function (items) {
                var listings = [];
                for (var propertyName in items) {
                    if (fixListing (items[propertyName]))
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
        },

        clearAllListings: function () {
            var keyPrefix = getListingKey ("");

            chrome.storage.local.get (null, function (items) {
                var listingKeys = [];
                for (var propertyName in items) {
                    if (!S(propertyName).startsWith (keyPrefix)) continue;
                    listingKeys.push (propertyName);
                }

                chrome.storage.local.remove (listingKeys);
            });
        }
    };
});