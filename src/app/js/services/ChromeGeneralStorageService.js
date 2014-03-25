"use strict";

/*
 * general app data persistence
 */
app.factory ("browserGeneralStorageService", function ($q) {

    var MAX_LAST_CRITERIA = 5;

    var LAST_CRITERIA = "lastCriteria";
    var LAST_FILTERS = "lastFilters";

    var getCriteriaKey = function (tabId) {
        return "criteria_" + tabId;
    };

    var getScrapeOptionsKey = function (tabId) {
        return "scrape_" + tabId;
    };

    var getMlsDetailsFetchListKey = function (tabId) {
        return "mlsFetchList_" + tabId;
    };

    // define this outside the service object b/c it's referenced internally
    var getLastCriteria = function () {
        var deferred = $q.defer ();

        chrome.storage.sync.get (LAST_CRITERIA, function (items) {
            var criteria = items[LAST_CRITERIA];
            if (!Utils.isDefinedAndNotNull (criteria))
                criteria = [];
            else if (!angular.isArray (criteria))
                criteria = [criteria];
            deferred.resolve (criteria);
        });

        return deferred.promise;
    };

    // define this outside the service object b/c it's referenced internally
    var saveLastCriteria = function (criteria) {
        var deferred = $q.defer ();

        getLastCriteria ().then (function (lastCriteria) {
            var criteriaTitle = Utils.getCriteriaDescription (criteria);
            var existingCriteria = lastCriteria.filter (function (c) { return Utils.getCriteriaDescription (c) === criteriaTitle; });
            if (existingCriteria.length > 0) {
                var idx = lastCriteria.indexOf (existingCriteria[0]);
                lastCriteria.splice (idx, 1);
                lastCriteria.splice (0, 0, existingCriteria[0]);
            } else {
                lastCriteria.splice (0, 0, criteria);
                if (lastCriteria.length > MAX_LAST_CRITERIA)
                    lastCriteria.splice (MAX_LAST_CRITERIA - 1, Number.MAX_VALUE);
            }
            var items = {};
            items[LAST_CRITERIA] = lastCriteria;

            chrome.storage.sync.set (items, function () {
                var error = chrome.runtime.lastError;
                if (typeof error !== "undefined") {
                    console.log ("Error saving " + key + ": " + error);
                    deferred.error (error);
                } else {
                    deferred.resolve ();
                }
            });
        });

        return deferred.promise;
    };

    return {

        getLastCriteria: getLastCriteria,

        saveLastCriteria: saveLastCriteria,

        publishCriteria: function (criteria, tabId) {
            var key = getCriteriaKey (tabId);
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

            var key = getCriteriaKey (tabId);

            chrome.storage.local.get (key, function (items) {
                var data = items[key];
                deferred.resolve (data);
                chrome.storage.local.remove (key);
            });

            return deferred.promise;
        },

        publishScrapeOptions: function (tabId, options) {
            var deferred = $q.defer ();

            var key = getScrapeOptionsKey (tabId);
            var items = {};
            items[key] = options;

            chrome.storage.local.set (items, function () { deferred.resolve (); });

            return deferred.promise;
        },

        consumeScrapeOptions: function (tabId) {
            var deferred = $q.defer ();

            if (typeof tabId === "undefined")
            {
                deferred.resolve (null);
                return deferred.promise;
            }

            var key = getScrapeOptionsKey (tabId);

            chrome.storage.local.get (key, function (items) {
                var data = items[key];
                deferred.resolve (data);
                chrome.storage.local.remove (key);
            });

            return deferred.promise;
        },
        
        saveMlsDetailsFetchList: function (tabId, mlsNums) {
            var deferred = $q.defer ();

            var key = getMlsDetailsFetchListKey (tabId);
            
            if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length === 0) {
                chrome.storage.local.remove (key, function () { deferred.resolve(); });
                return deferred.promise;
            }
            
            var items = {};
            items[key] = mlsNums;

            chrome.storage.local.set (items, function () { deferred.resolve(); });

            return deferred.promise;
        },

        getMlsDetailsFetchList: function (tabId) {
            var deferred = $q.defer ();

            if (typeof tabId === "undefined")
            {
                deferred.resolve (null);
                return deferred.promise;
            }

            var key = getMlsDetailsFetchListKey (tabId);

            chrome.storage.local.get(key, function (items) {
                var data = items[key];
                deferred.resolve (data);
            });

            return deferred.promise;
        },
        
        clearAllTempData: function () {
            var criteriaKeyPrefix = getCriteriaKey ("");
            var scrapeKeyPrefix = getScrapeOptionsKey ("");
            var detailsKeyPrefix = getMlsDetailsFetchListKey ("");

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
        },
        
        saveLastListingsFilters: function (filters) {
            var deferred = $q.defer();

            var items = {};
            items[LAST_FILTERS] = filters;

            chrome.storage.sync.set (items, function () {
                var error = chrome.runtime.lastError;
                if (typeof error !== "undefined")
                {
                    console.log ("Error saving " + key + ": " + error);
                    deferred.error (error);
                }
                else
                {
                    deferred.resolve ();
                }
            });

            return deferred.promise;
        },
        
        getLastListingsFilters: function () {
            var deferred = $q.defer ();

            chrome.storage.sync.get (LAST_FILTERS, function (items) {
                var data = items[LAST_FILTERS];
                if (typeof data === "undefined")
                    data = null;
                deferred.resolve (data);
            });

            return deferred.promise;
        }
    };
});