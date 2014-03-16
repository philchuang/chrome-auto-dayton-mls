"use strict";

app.service ("listingStorageService", function ($q) {

    var getListingKey = function (tabId) {
        return "listing_" + tabId;
    };
    
    // temporary function used to massage in-dev properties
    var fixListing = function (listing) {
        var modified = false;
        if (typeof listing === "undefined" || listing === null) return modified;

        if (typeof listing.rooms !== "undefined" && listing.rooms !== null)
        {
            var entrances = listing.rooms.filter (function (r) {
                return r.name === "Entrance";
            });
            $.each(entrances, function (idx, r2) {
                r2.level = "1";
            });
            modified = modified || entrances.length > 0;
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

            chrome.storage.local.get (ids, function (items) {
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
            var keyPrefix = getListingKey(id);
            chrome.storage.local.remove (keyPrefix);
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