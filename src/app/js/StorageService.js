'use strict';

var storageServiceBase = storageServiceBase || {

    LAST_CRITERIA: "lastCriteria",

    getCriteriaKey: function (tabId) {
        return "criteria_" + tabId;
    }

};

app.factory('storageService', function ($q) {
    return {
        
        getLastCriteria: function () {
            var deferred = $q.defer();

            chrome.storage.sync.get(storageServiceBase.LAST_CRITERIA, function (items) {
                var criteria = items[storageServiceBase.LAST_CRITERIA];
                if (typeof criteria == "undefined")
                    criteria = null;
                deferred.resolve(criteria);
            });

            return deferred.promise;
        },

        saveLastCriteria: function (criteria) {
            var val = {};
            val[storageServiceBase.LAST_CRITERIA] = criteria;

            chrome.storage.sync.set (val);
        },

        publishCriteria: function (criteria, tabId) {
            var criteriaKey = storageServiceBase.getCriteriaKey(tabId);
            var val = {};
            val[criteriaKey] = criteria;

            chrome.storage.local.set(val);

            if (criteria != null)
                saveLastCriteria(criteria);
        },

        consumeCriteria: function (tabId) {
            if (typeof tabId == "undefined")
                return null;

            var deferred = $q.defer();

            var criteriaKey = storageServiceBase.getCriteriaKey(tabId);

            chrome.storage.local.get(criteriaKey, function (items) {
                deferred.resolve(items[criteriaKey]);
            });

            return deferred.promise;
        }
    };
});