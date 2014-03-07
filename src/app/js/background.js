'use strict';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var storageService = angular.injector (["AutoDaytonMls", "ng"]).get ("storageService");

    if (request.action == "consumeCriteria")
    {
        var criteria = storageService.consumeCriteria(sender.tab.id);
        sendResponse(criteria);
    }
});
