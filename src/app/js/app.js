// CONSTANTS
var DAYTON_RAPMLS_PARTIAL_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton";
var DAYTON_RAPMLS_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1";

// GLOBALS

// map of tab id -> criteria
var _CriteriaMap = {};

// UTIL FUNCTIONS

function displayDebugNotification (message)
{
	chrome.notifications.create ("", { type: "basic", title: "DEBUG", message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (id) {});
}

function displayNotification (id, title, message)
{
	chrome.notifications.create (id, { type: "basic", title: title, message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (id) {});
}

// BIZ LOGIC

function searchDaytonRapmls (criteria, tab)
{
	if (typeof tab != "undefined")
	{
		// re-use the given tab
		publishCriteria (criteria, tab.id);
		chrome.tabs.update (tab.id, { url: DAYTON_RAPMLS_URL });
		return;
	}

	// if active tab is the DAYTON MLS search page, use that - else, create a new tab
	chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
		if (!(S(tabs[0].url).startsWith (DAYTON_RAPMLS_PARTIAL_URL)))
		{
			chrome.tabs.create ({ url: DAYTON_RAPMLS_URL }, function (newTab) {
				publishCriteria (criteria, newTab.id);
				// TODO figure out what happens if new tab calls consume before publish is called
			});
		}
		else
		{
			publishCriteria (criteria, tabs[0].id);
			setCriteriaAndExecute (tabs[0].id, consumeCriteria (tabs[0].id));
		}
	});
}

function setCriteriaAndExecute (tabId, criteria)
{
	var message = { "action": "setCriteriaAndExecute", "criteria": criteria };
	chrome.tabs.sendMessage (tabId, message);
}

function getLastCriteria (callback)
{
	chrome.storage.sync.get ("lastCriteria", callback);
}

function saveLastCriteria (criteria)
{
	chrome.storage.sync.set ({ "lastCriteria" : criteria });
}

function publishCriteria (criteria, tabId)
{
	_CriteriaMap[tabId] = criteria;
	if (criteria != null)
		saveLastCriteria (criteria);
}

function consumeCriteria (tabId)
{
	if (typeof tabId == "undefined"
		|| typeof _CriteriaMap[tabId] == "undefined")
		return null;
	
	var crit = _CriteriaMap[tabId];
	delete _CriteriaMap[tabId];

	return crit;
}

chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
	if (request.action == "consumeCriteria")
	{
		var criteria = consumeCriteria (sender.tab.id);
		sendResponse (criteria);
	}
});
