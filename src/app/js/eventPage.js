"use strict";

// TODO rewrite so that angular can inject storageService - angular bootstrap tie-in?
chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
    var injector = angular.injector (["AutoDaytonMls", "ng"]);
    var notificationService = injector.get ("notificationService");
    var storageService = injector.get ("storageService");
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
        scrapeService.processListing (request.listing).then (function (result) {
            sendResponse (result);
        });
        return true; // this keeps the message channel open for asynchronous response
    }

    if (request.action === "updateListingStaleness") {
        scrapeService.updateListingStaleness ();
        return false;
    }

    if (request.action === "getAllListings") {
        storageService.getAllListings ().then (function (listings) {
            sendResponse (listings);
        });
        return true; // this keeps the message channel open for asynchronous response
    }
    
    if (request.action === "displayNotification") {
        notificationService.displayNotification (request.id, request.title, request.message);
        return false;
    }

    return false;
});