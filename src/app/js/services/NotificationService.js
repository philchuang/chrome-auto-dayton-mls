"use strict";

/*
 * Handles notifications, using Chrome API
 */
app.factory ("notificationService", function () {
    return {

        displayDebugNotification: function (message) {
            chrome.notifications.create ("", { type: "basic", title: "DEBUG", message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (id) {});
        },

        displayNotification: function (id, title, message) {
            chrome.notifications.create (id, { type: "basic", title: title, message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (id) {});
        }

    };
});