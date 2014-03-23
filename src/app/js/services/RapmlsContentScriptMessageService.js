"use strict";

/*
 * Sends a message to the given tab to execute a MLS search with the given criteria, using Chrome API
 */
// TODO rename
app.factory ("rapmlsContentScriptMessageService", function () {
    return {

        sendCriteriaToTab: function (tabId, criteria, response) {
            var message = { "action": "setCriteriaAndExecute", "criteria": criteria };
            chrome.tabs.sendMessage (tabId, message, response);
        }

    };
});
