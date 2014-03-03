chrome.browserAction.onClicked.addListener(function(activeTab)
{
    chrome.tabs.create({ url: "http://www.dabr.com" }, function(newTab) {
    	// TODO ???
    });
});