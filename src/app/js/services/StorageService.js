'use strict';

var storageServiceBase = storageServiceBase || {

    LAST_CRITERIA: "lastCriteria",

    getCriteriaKey: function (tabId) {
        return "criteria_" + tabId;
    }

};

app.factory ('storageService', function ($q) {

    // define this outside the service object b/c it's referenced internally
    var saveLastCriteria = function (criteria) {
        var val = {};
        val[storageServiceBase.LAST_CRITERIA] = criteria;

        chrome.storage.sync.set (val);
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
            var criteriaKey = storageServiceBase.getCriteriaKey (tabId);
            var val = {};
            val[criteriaKey] = criteria;

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

            var criteriaKey = storageServiceBase.getCriteriaKey (tabId);

            chrome.storage.local.get (criteriaKey, function (items) {
                var criteria = items[criteriaKey];
                deferred.resolve(criteria);
                chrome.storage.local.remove (criteriaKey);
            });

            return deferred.promise;
        }
    };
});