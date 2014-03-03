// CONSTANTS
var DAYTON_RAPMLS_PARTIAL_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton";
var DAYTON_RAPMLS_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1";

// GLOBALS
var _currentCriteria;

// UTIL FUNCTIONS

function displayDebugNotification (message)
{
	chrome.notifications.create("", { type: "basic", title: "DEBUG", message: message, iconUrl: "/dabr.png" }, function (id) {});
}

// BIZ LOGIC

function searchDaytonRapmls (criteria)
{
	publishCriteria (criteria);
	chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
		if (!(S(tabs[0].url).startsWith (DAYTON_RAPMLS_PARTIAL_URL)))
		{
			chrome.tabs.create ({ url: DAYTON_RAPMLS_URL }, function (tab) { });
		}
		else
		{
			setCriteriaAndExecute (tabs[0], consumeCriteria());
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

function publishCriteria (criteria)
{
	_currentCriteria = criteria;
	if (criteria != null)
		chrome.storage.sync.set({ "lastCriteria" : criteria });
}

function consumeCriteria ()
{
	if (_currentCriteria == null)
		return null;
	
	var crit = _currentCriteria;
	_currentCriteria = null;

	return crit;
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.action == "consumeCriteria")
		{
			var criteria = consumeCriteria();
			sendResponse(criteria);
		}
});
