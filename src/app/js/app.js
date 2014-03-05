// CONSTANTS
var DAYTON_RAPMLS_PARTIAL_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton";
var DAYTON_RAPMLS_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1";

// GLOBALS
var _currentCriteria;

// UTIL FUNCTIONS

function displayDebugNotification (message)
{
	chrome.notifications.create ("", { type: "basic", title: "DEBUG", message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (id) {});
}

function displayNotification (title, message)
{
	chrome.notifications.create ("", { type: "basic", title: title, message: message, iconUrl: "/app/resources/icons/icon80.png" }, function (id) {});
}

// BIZ LOGIC

function searchDaytonRapmls (criteria, tab)
{
	publishCriteria (criteria);

	if (typeof tab != "undefined")
	{
		// re-use the given tab
		chrome.tabs.update (tab.id, { url: DAYTON_RAPMLS_URL });
		return;
	}

	// if active tab is the DAYTON MLS search page, use that - else, create a new tab
	chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
		if (!(S(tabs[0].url).startsWith (DAYTON_RAPMLS_PARTIAL_URL)))
		{
			chrome.tabs.create ({ url: DAYTON_RAPMLS_URL });
		}
		else
		{
			setCriteriaAndExecute (tabs[0], consumeCriteria ());
		}
	});
}

function setCriteriaAndExecute (tab, criteria)
{
	var message = { "action": "setCriteriaAndExecute", "criteria": criteria };
	chrome.tabs.sendMessage (tab.id, message);
}

function getLastCriteria (callback)
{
	chrome.storage.sync.get ("lastCriteria", callback);
}

function saveLastCriteria (criteria)
{
	chrome.storage.sync.set ({ "lastCriteria" : criteria });
}

function publishCriteria (criteria)
{
	_currentCriteria = criteria;
	if (criteria != null)
		saveLastCriteria (criteria);
}

function consumeCriteria ()
{
	if (_currentCriteria == null)
		return null;
	
	var crit = _currentCriteria;
	_currentCriteria = null;

	return crit;
}

chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
	if (request.action == "consumeCriteria")
	{
		var criteria = consumeCriteria ();
		sendResponse (criteria);
	}
});
