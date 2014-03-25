"use strict";

var browserMessageService = browserMessageService || {
    sendMessage: function (message, responseHandler) {
        chrome.runtime.sendMessage (message, responseHandler);
    },

    addListener: function (requestSenderResponseHandlerHandler) {
        chrome.runtime.onMessage.addListener (requestSenderResponseHandlerHandler);
    }
};