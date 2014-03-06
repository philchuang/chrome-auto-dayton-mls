'use strict'

// -- BOOKMARK METHODS ----------------------------------------------------------------------------

function addOrUpdateBookmark (criteria)
{
	createOrGetBookmarkFolder (function (folderId) {
		var title = getBookmarkTitle (criteria);
		var url = getBookmarkLink (criteria);

		createOrGetBookmark (folderId, title, function (node) {
			if (typeof node == "undefined" || node == null)
			{
				chrome.bookmarks.create ({ parentId: folderId, title: title, url: url }, function (_) {
					// TODO turn notification into a service
					chrome.extension.getBackgroundPage ().displayNotification ("bookmark", "Bookmark created", title);
				});
			}
			else
			{
				chrome.bookmarks.update (node.id, { url: url }, function (_) {
					// TODO turn notification into a service
					chrome.extension.getBackgroundPage ().displayNotification ("bookmark", "Bookmark updated", title);
				});
			}
		});
	});
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

// -- INITIALIZATION ------------------------------------------------------------------------------

function getLastCriteria ()
{
	// TODO turn sync storage into a service
	chrome.extension.getBackgroundPage ().getLastCriteria (function (items) {
		var criteria = items["lastCriteria"];
	});
}

chrome.extension.getBackgroundPage ().App.controller ("SearchController", function ($scope)
{
	// TODO detect URL params and immediately execute search

	$scope.criteria = getLastCriteria ();

	$scope.executeSearch = function (criteria) {
		// TODO turn search execution into a service
		chrome.extension.getBackgroundPage ().searchDaytonRapmls (criteria);
	};

	$scope.bookmarkSearch = function (criteria) {
		addOrUpdateBookmark (criteria);
	};

});