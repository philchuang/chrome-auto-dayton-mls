"use strict";

// is there a better place to put this?
chrome.notifications.onClicked.addListener(function (notificationId) {
    var injector = angular.injector(["AutoDaytonMls", "ng"]);
    var browserTabsService = injector.get("browserTabsService");

    browserTabsService.openNewTab (browserTabsService.listingsUrl);
});

/*
 * Handles notifications, using Chrome API
 */
app.factory ("browserNotificationService", function () {

    return {

        displayDebugNotification: function (message) {
            chrome.notifications.create ("", { type: "basic", title: "DEBUG", message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (notificationId) {});
        },

        displayNotification: function (id, title, message) {
            chrome.notifications.create (id, { type: "basic", title: title, message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (notificationId) {});
        }

    };
});