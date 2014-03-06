// -- FORM METHODS --------------------------------------------------------------------------------

function setForm (criteria) {
	if (typeof criteria == "undefined" || criteria == null)
		criteria = {};

	$("input[name='minPrice']").val (criteria.minPriceK);
	$("input[name='maxPrice']").val (criteria.maxPriceK);
	$("select[name='minBedrooms']").val (criteria.minBedrooms);
	$("textarea[name='zipCodes']").val (criteria.zipCodes);
	if (criteria && criteria.mls && criteria.mls.length)
		$("textarea[name='mls']").val (S(criteria.mls).toCSV (", ", null));
	else
		$("textarea[name='mls']").val ();
}

function generateCriteria ()
{
	var criteria = {};
	criteria.minPriceK = $("input[name='minPrice']").val ();
	criteria.maxPriceK = $("input[name='maxPrice']").val ();
	criteria.minBedrooms = $("select[name='minBedrooms']").val ();
	criteria.zipCodes = $("textarea[name='zipCodes']").val ();
	criteria.mls = $("textarea[name='mls']").val ().split (",");
	if (criteria.mls.length == 1 && criteria.mls[0] == "")
	{
		criteria.mls = [];
	}
	else
	{
		for (var i = 0; i < criteria.mls.length; i++)
		{
			criteria.mls[i] = S(criteria.mls[i]).trim ().s;
		}
	}

	return criteria;
}

// -- BOOKMARK METHODS ----------------------------------------------------------------------------

function getBookmarkLink (criteria)
{
	var url = location.href;

	if (criteria.minPriceK.length != 0
		|| criteria.maxPriceK.length != 0
		|| criteria.minBedrooms.length != 0
		|| criteria.zipCodes.length != 0
		|| criteria.mls.length != 0)
	{
		url += "?" + $.param (criteria);
	}

	return url;
}

function getBookmarkTitle (criteria)
{
	var title = "";

	// MLS supercedes all else
	if (criteria.mls.length > 0)
	{
		title += "MLS: ";
		for (var i = 0; i < criteria.mls.length; i++)
		{
			if (i != 0)
				title += ", ";
			title += criteria.mls[i];
		}
		return title;
	}
	
	if (criteria.minPriceK.length != 0 && criteria.maxPriceK.length != 0)
		title += "$"+criteria.minPriceK+"K < $"+criteria.maxPriceK+"K, ";
	else if (criteria.minPriceK.length != 0)
		title += ">$"+criteria.minPriceK+"K, ";
	else if (criteria.maxPriceK.length != 0)
		title += "<$"+criteria.maxPriceK+"K, ";

	if (criteria.minBedrooms.length != 0 && criteria.minBedrooms > 0)
		title += criteria.minBedrooms + "+ bed, ";

	if (criteria.zipCodes.length != 0)
		title += "zips " + criteria.zipCodes + ", ";

	// cleanup
	if (title.substr (title.length - 2) == ", ")
		title = title.substr (0, title.length - 2);

	if (title.length == 0)
		title = "Empty search";

	return title;
}

function createOrGetBookmarkFolder (folderIdCallback)
{
	chrome.bookmarks.search ("Dayton MLS searches", function (nodes) {
		if (typeof nodes == "undefined" || nodes.length == 0)
		{
			chrome.bookmarks.create ({ title: "Dayton MLS searches" }, function (node) {
				folderIdCallback (node.id);
			});
			return;
		}
		folderIdCallback (nodes[0].id);
	});
}

function createOrGetBookmark (folderId, title, nodeCallback)
{
	chrome.bookmarks.getChildren (folderId, function (nodes) {
		if (typeof nodes != "undefined" && nodes.length > 0)
		{
			for (var i = 0; i < nodes.length; i++)
			{
				console.log(nodes[i].title);
				if (nodes[i].title == title)
				{
					nodeCallback (nodes[i]);
					return;
				}
			}
		}
		
		nodeCallback (null);
	});
}

function addOrUpdateBookmark ()
{
	createOrGetBookmarkFolder (function (folderId) {
		var criteria = generateCriteria ();
		var title = getBookmarkTitle (criteria);
		var url = getBookmarkLink (criteria);

		createOrGetBookmark (folderId, title, function (node) {
			if (typeof node == "undefined" || node == null)
			{
				chrome.bookmarks.create ({ parentId: folderId, title: title, url: url }, function (_) {
					chrome.extension.getBackgroundPage ().displayNotification ("Bookmark created", title);
				});
			}
			else
			{
				chrome.bookmarks.update (node.id, { url: url }, function (_) {
					chrome.extension.getBackgroundPage ().displayNotification ("Bookmark updated", title);
				});
			}
		});
	});
}

// -- INITIALIZATION ------------------------------------------------------------------------------

function getLastCriteriaAndSetForm ()
{
	chrome.extension.getBackgroundPage ().getLastCriteria (function (items) {
		var criteria = items["lastCriteria"];
		setForm (criteria);
	});
}

function getUrlCriteriaAndExecute ()
{
	if (location.search.length == 0) return;

	chrome.tabs.getCurrent (function (tab) {
		var criteria = jQuery.deparam (location.search.substr (1));
		setForm (criteria);
		chrome.extension.getBackgroundPage ().searchDaytonRapmls (criteria, tab);
	});
}

function wireSearchButton ()
{
	$("#searchButton").click (function (e) {
		e.preventDefault ();
		chrome.extension.getBackgroundPage ().searchDaytonRapmls (generateCriteria ());
	});
}

function wireBookmarkButton ()
{
	$("#bookmarkButton").click (function (e) {
		e.preventDefault ();
		addOrUpdateBookmark ();
	});
}

/// Bootstrap dropdown
function wireMinBedroomsDropdown ()
{
	var $pickButton = $("#minBedroomsDropdownBtn");

	$("#minBedroomsDropdown li a").on ("click", function () {
		var text = $(this).text();
		$pickButton.text (text);
	});
}

document.addEventListener ("DOMContentLoaded", function ()
{
	getLastCriteriaAndSetForm ();

	//wireMinBedroomsDropdown ();

	wireSearchButton ();

	wireBookmarkButton ();

	getUrlCriteriaAndExecute ();
});

// -- UTILITY METHODS -----------------------------------------------------------------------------

function debug (message)
{
	$("textarea#debug").val(message);
}

function debugInfo (message)
{
	chrome.extension.getBackgroundPage ().displayNotification ("INFO", message);
}