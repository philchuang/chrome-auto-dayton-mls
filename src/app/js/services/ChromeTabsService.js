"use strict";

/*
 * handles chrome tabs
 */
app.factory ("browserTabsService", function ($q) {

    return {

        getAppUrl: function (relativeUrl) {
            return chrome.runtime.getURL (relativeUrl);
        },

        getCurrentTabUrl: function () {
            var deferred = $q.defer ();

            chrome.tabs.query ({ active: true, currentWindow: true }, function (tabs) {
                deferred.resolve (Utils.isDefinedAndNotNull (tabs) && tabs.length > 0 ? tabs[0].url : null);
            });

            return deferred.promise;
        },

        updateCurrentTabUrl: function (url) {
            var deferred = $q.defer ();

            chrome.tabs.query ({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update (tabs[0].id, { url: url });
                deferred.resolve ();
            });

            return deferred.promise;
        },

        getCurrentTabId: function () {
            var deferred = $q.defer ();

            chrome.tabs.query ({ active: true, currentWindow: true }, function (tabs) {
                deferred.resolve (Utils.isDefinedAndNotNull (tabs) && tabs.length > 0 ? tabs[0].id : null);
            });

            return deferred.promise;
        },

        updateTabUrl: function (tabId, url) {
            var deferred = $q.defer ();

            chrome.tabs.update (tabId, { url: url }, function () {
                deferred.resolve ();
            });

            return deferred.promise;
        },

        openNewTab: function (url) {
            var deferred = $q.defer ();

            chrome.tabs.create ({ url: url }, function (tab) {
                deferred.resolve (tab.id);
            });

            return deferred.promise;
        },

        sendMessageToCurrentPage: function (message) {
            var deferred = $q.defer ();

            chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
                if (!Utils.isDefinedAndNotNull (tabs) || tabs.length === 0) {
                    deferred.resolve ();
                    return;
                }

                chrome.tabs.sendMessage (tabs[0].id, message, function (response) {
                    deferred.resolve (response);
                });
            });

            return deferred.promise;
        },

        sendMessageToTab: function (tabId, message) {
            var deferred = $q.defer();

            chrome.tabs.sendMessage (tabId, message, function (response) {
                deferred.resolve (response);
            });

            return deferred.promise;
        } 
    };

});