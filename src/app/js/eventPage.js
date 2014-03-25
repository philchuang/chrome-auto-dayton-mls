"use strict";

// FUTURE rewrite so that angular can inject dependencies

// lifecycle
chrome.runtime.onInstalled.addListener (function (details) {
    var injector = angular.injector (["AutoDaytonMls", "ng"]);
    var browserGeneralStorageService = injector.get ("browserGeneralStorageService");

    browserGeneralStorageService.clearAllTempData ();
});

// TODO extract Chrome API calls
// TODO split listeners into area/module specific files

chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
    var injector = angular.injector (["AutoDaytonMls", "ng"]);
    var browserNotificationService = injector.get ("browserNotificationService");
    var browserGeneralStorageService = injector.get ("browserGeneralStorageService");
    var scrapeService = injector.get ("scrapeService");

    if (request.action === "consumeCriteria") {
        browserGeneralStorageService.consumeCriteria (sender.tab.id).then (function (criteria) {
             sendResponse(criteria);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "consumeScrapeOptions") {
        browserGeneralStorageService.consumeScrapeOptions (sender.tab.id).then (function (options) {
            sendResponse (options);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "publishScrapeOptions") {
        browserGeneralStorageService.publishScrapeOptions (sender.tab.id, request.options).then (function () {
            sendResponse ();
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
            browserGeneralStorageService.saveMlsDetailsFetchList (sender.tab.id, mlsNums).then (function () {
                sendResponse (mlsNums);
            });
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "saveMlsDetailsFetchList") {
        browserGeneralStorageService.saveMlsDetailsFetchList (sender.tab.id, request.mlsNums);
        return false;
    }

    if (request.action === "getMlsDetailsFetchList") {
        browserGeneralStorageService.getMlsDetailsFetchList (sender.tab.id).then (function (mlsNums) {
            sendResponse (mlsNums);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "displayNotification") {
        browserNotificationService.displayNotification (request.id, request.title, request.message);
        return false;
    }

    console.log ("Unable to handle action: " + request.action);

    return false;
});