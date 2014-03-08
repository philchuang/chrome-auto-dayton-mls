app.factory('rapmlsContentScriptMessageService', function () {
    return {

        sendCriteriaToTab: function (tabId, criteria, response) {
            var message = { "action": "setCriteriaAndExecute", "criteria": criteria };
            chrome.tabs.sendMessage(tabId, message, response);
        }

    };
});
