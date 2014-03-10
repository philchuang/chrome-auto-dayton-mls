"use strict";

var storageServiceBase = storageServiceBase || {

    LAST_CRITERIA: "lastCriteria",

    getCriteriaKey: function (tabId) {
        return "criteria_" + tabId;
    },

    getListingKey: function (tabId) {
        return "listing_" + tabId;
    }

};

app.service ('storageService', function ($q) {

    // define this outside the service object b/c it's referenced internally
    var saveLastCriteria = function (criteria) {
        var items = {};
        items[storageServiceBase.LAST_CRITERIA] = criteria;

        chrome.storage.sync.set(items);
    };

    return {

        getLastCriteria: function () {
            var deferred = $q.defer ();

            chrome.storage.sync.get (storageServiceBase.LAST_CRITERIA, function (items) {
                var criteria = items[storageServiceBase.LAST_CRITERIA];
                if (typeof criteria == "undefined")
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

            chrome.storage.local.set (val);

            if (criteria != null)
                saveLastCriteria (criteria);
        },

        consumeCriteria: function (tabId) {
            var deferred = $q.defer ();

            if (typeof tabId == "undefined")
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

        getListing: function (id) {
            var deferred = $q.defer ();

            if (typeof id == "undefined") {
                deferred.resolve (null);
                return deferred.promise;
            }

            var key = storageServiceBase.getListingKey (id);

            chrome.storage.sync.get (key, function (items) {
                var data = items[key];
                deferred.resolve (data);
            });
        },

        saveListing: function (listing) {
            var key = storageServiceBase.getListingKey(id);
            var items = {};
            items[key] = listing;

            chrome.storage.sync.set(items);
        }
    };
});