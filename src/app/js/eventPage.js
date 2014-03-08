"use strict";

// TODO rewrite so that angular can inject storageService - angular bootstrap tie-in?
chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
    var injector = angular.injector (["AutoDaytonMls", "ng"]);
    var storageService = injector.get ("storageService");

    if (request.action == "consumeCriteria") {
        storageService.consumeCriteria (sender.tab.id).then (function (criteria) { sendResponse(criteria); });
        return true; // this keeps the message channel open for asynchronous response
    }

    return false;
});