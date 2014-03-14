"use strict";

var storageServiceBase = storageServiceBase || {

    LAST_CRITERIA: "lastCriteria",

    // long-term data

    getListingKey: function (tabId) {
        return "listing_" + tabId;
    },
    
    // temp data

    getCriteriaKey: function (tabId) {
        return "criteria_" + tabId;
    },

    getScrapeOptionsKey: function (tabId) {
        return "scrape_" + tabId;
    },

    getMlsDetailsFetchListKey: function (tabId) {
        return "mlsFetchList_" + tabId;
    }

};

app.service ('storageService', function ($q) {

    // define this outside the service object b/c it's referenced internally
    var saveLastCriteria = function (criteria) {
        var items = {};
        items[storageServiceBase.LAST_CRITERIA] = criteria;

        chrome.storage.sync.set (items, function () {
            var error = chrome.runtime.lastError;
            if (typeof error !== "undefined")
                console.log ("Error saving " + key + ": " + error);
        });
    };

    var getListing = function (id) {
        var deferred = $q.defer ();

        if (typeof id === "undefined") {
            deferred.resolve (null);
            return deferred.promise;
        }

        var key = storageServiceBase.getListingKey (id);

        chrome.storage.local.get (key, function (items) {
            var data = items[key];
            deferred.resolve (data);
        });

        return deferred.promise;
    };

    return {

        getLastCriteria: function () {
            var deferred = $q.defer ();

            chrome.storage.sync.get (storageServiceBase.LAST_CRITERIA, function (items) {
                var criteria = items[storageServiceBase.LAST_CRITERIA];
                if (typeof criteria === "undefined")
                    criteria = null;
                deferred.resolve (criteria);
            });

            return deferred.promise;
        },

        saveLastCriteria: saveLastCriteria,

        publishCriteria: function (criteria, tabId) {
            var key = storageServiceBase.getCriteriaKey (tabId);
            var items = {};
            items[key] = criteria;

            chrome.storage.local.set (items);

            if (criteria != null)
                saveLastCriteria (criteria);
        },

        consumeCriteria: function (tabId) {
            var deferred = $q.defer ();

            if (typeof tabId === "undefined")
            {
                deferred.resolve (null);
                return deferred.promise;
            }

            var key = storageServiceBase.getCriteriaKey (tabId);

            chrome.storage.local.get(key, function (items) {
                var data = items[key];
                deferred.resolve(data);
                chrome.storage.local.remove (key);
            });

            return deferred.promise;
        },

        publishScrapeOptions: function (tabId, options) {
            var key = storageServiceBase.getScrapeOptionsKey(tabId);
            var items = {};
            items[key] = options;

            chrome.storage.local.set (items);
        },

        consumeScrapeOptions: function (tabId) {
            var deferred = $q.defer ();

            if (typeof tabId === "undefined")
            {
                deferred.resolve (null);
                return deferred.promise;
            }

            var key = storageServiceBase.getScrapeOptionsKey (tabId);

            chrome.storage.local.get (key, function (items) {
                var data = items[key];
                deferred.resolve (data);
                chrome.storage.local.remove (key);
            });

            return deferred.promise;
        },
        
        getAllListings: function () {
            var deferred = $q.defer();

            var keyPrefix = storageServiceBase.getListingKey ("");

            chrome.storage.local.get (null, function (items) {
                var listings = [];
                for (var propertyName in items) {
                    if (!S(propertyName).startsWith (keyPrefix)) continue;
                    listings.push (items[propertyName]);
                }
                deferred.resolve (listings);
            });

            return deferred.promise;
        },
        
        getListings: function (mlsNums) {
            var deferred = $q.defer();

            if (typeof mlsNums === "undefined" || mlsNums == null || mlsNums.length === 0)
            {
                deferred.resolve([]);
                return deferred.promise;
            }

            var listings = [];
            
            for (var i = 0; i < mlsNums.length; i++) {
                getListing (mlsNums[i]).then (function (listing) {
                    listings.push (listing);
                    if (listings.length === mlsNums.length)
                        deferred.resolve (listings);
                });
            }

            return deferred.promise;
        },
        
        getListing: getListing,

        clearAllListings: function () {
            var keyPrefix = storageServiceBase.getListingKey ("");

            chrome.storage.local.get (null, function (items) {
                var listingKeys = [];
                for (var propertyName in items) {
                    if (!S(propertyName).startsWith (keyPrefix)) continue;
                    listingKeys.push (propertyName);
                }

                chrome.storage.local.remove (listingKeys);
            });
        },

        saveListing: function (listing) {
            var key = storageServiceBase.getListingKey (listing.id);
            var items = {};
            items[key] = listing;

            chrome.storage.local.set (items, function () {
                var error = chrome.runtime.lastError;
                if (typeof error !== "undefined")
                    console.log("Error saving " + key + ": " + error);
            });
        },

        saveMlsDetailsFetchList: function (tabId, mlsNums) {
            var key = storageServiceBase.getMlsDetailsFetchListKey(tabId);
            
            if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length === 0) {
                chrome.storage.local.remove (key);
                return;
            }
            
            var items = {};
            items[key] = mlsNums;

            chrome.storage.local.set (items);
        },

        getMlsDetailsFetchList: function (tabId) {
            var deferred = $q.defer ();

            if (typeof tabId === "undefined")
            {
                deferred.resolve (null);
                return deferred.promise;
            }

            var key = storageServiceBase.getMlsDetailsFetchListKey (tabId);

            chrome.storage.local.get(key, function (items) {
                var data = items[key];
                deferred.resolve (data);
            });

            return deferred.promise;
        },
        
        clearAllTempData: function () {
            var criteriaKeyPrefix = storageServiceBase.getCriteriaKey ("");
            var scrapeKeyPrefix = storageServiceBase.getScrapeOptionsKey ("");
            var detailsKeyPrefix = storageServiceBase.getMlsDetailsFetchListKey ("");

            chrome.storage.local.get(null, function (items) {
                var keys = [];
                for (var propertyName in items) {
                    if (S(propertyName).startsWith (criteriaKeyPrefix)
                        || S(propertyName).startsWith (scrapeKeyPrefix)
                        || S(propertyName).startsWith (detailsKeyPrefix))                        
                        keys.push (propertyName);
                }

                chrome.storage.local.remove (keys);
            });
        }
    };
});