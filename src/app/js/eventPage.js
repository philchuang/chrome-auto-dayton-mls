"use strict";

// TODO rewrite so that angular can inject dependencies

// lifecycle
chrome.runtime.onInstalled.addListener (function (details) {
    var injector = angular.injector (["AutoDaytonMls", "ng"]);
    var storageService = injector.get("storageService");

    storageService.clearAllTempData ();
});

// TODO split listeners into area/module specific files

chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
    var injector = angular.injector (["AutoDaytonMls", "ng"]);
    var notificationService = injector.get ("notificationService");
    var storageService = injector.get ("storageService");
    var listingStorageService = injector.get ("listingStorageService");
    var scrapeService = injector.get ("scrapeService");

    if (request.action === "consumeCriteria") {
        storageService.consumeCriteria (sender.tab.id).then (function (criteria) {
             sendResponse(criteria);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "consumeScrapeOptions") {
        storageService.consumeScrapeOptions (sender.tab.id).then (function (options) {
            sendResponse (options);
        });
        return true; // this keeps the message channel open for asynchronous response
    }
    
    if (request.action === "processListing") {
        scrapeService.processListing (request.listing).then (function (resultAndListing) {
            sendResponse (resultAndListing);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "updateListingStaleness") {
        scrapeService.updateListingStaleness ();
        return false;
    }
    
    if (request.action === "checkNeedsListingDetails") {
        scrapeService.checkNeedsListingDetails (request.mlsNums).then (function (mlsNums) {
            if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length == 0) {
                sendResponse(null);
                return;
            }
            storageService.saveMlsDetailsFetchList (sender.tab.id, mlsNums).then (function () {
                sendResponse (mlsNums);
            });
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "saveMlsDetailsFetchList") {
        storageService.saveMlsDetailsFetchList (sender.tab.id, request.mlsNums);
        return false;
    }

    if (request.action === "getMlsDetailsFetchList") {
        storageService.getMlsDetailsFetchList (sender.tab.id).then (function (mlsNums) {
            sendResponse (mlsNums);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "displayNotification") {
        notificationService.displayNotification (request.id, request.title, request.message);
        return false;
    }

    console.log ("Unable to handle action: " + request.action);

    return false;
});