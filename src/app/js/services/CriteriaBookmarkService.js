"use strict";

/*
 * handles chrome bookmarks for search criteria
 */
// TODO extract chrome calls
app.factory ("criteriaBookmarkService", function (notificationService) {

    var createOrGetBookmarkFolder = function (folderIdCallback)
    {
        chrome.bookmarks.search ("Dayton MLS searches", function (nodes)
        {
            if (!Utils.isDefinedAndNotNull (nodes) || nodes.length === 0)
            {
                chrome.bookmarks.create ({ title: "Dayton MLS searches" }, function (node) {
                    folderIdCallback (node.id);
                });
                return;
            }
            folderIdCallback (nodes[0].id);
        });
    };

    var createOrGetBookmark = function (folderId, title, nodeCallback)
    {
        chrome.bookmarks.getChildren (folderId, function (nodes)
        {
            if (Utils.isDefinedAndNotNull (nodes) && nodes.length > 0)
            {
                for (var i = 0; i < nodes.length; i++)
                {
                    if (nodes[i].title == title)
                    {
                        nodeCallback (nodes[i]);
                        return;
                    }
                }
            }

            nodeCallback (null);
        });
    };

    var getBookmarkTitle = function (criteria)
    {
        var title = "";

        // MLS supercedes all else
        if (Utils.isDefinedAndNotNull (criteria.mls) && criteria.mls.length > 0)
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

        if (Utils.isDefinedAndNotNull (criteria.minPriceK) && criteria.minPriceK.length != 0
            && Utils.isDefinedAndNotNull (criteria.maxPriceK) && criteria.maxPriceK.length != 0)
            title += "$" + criteria.minPriceK + "K < $" + criteria.maxPriceK + "K, ";
        else if (Utils.isDefinedAndNotNull (criteria.minPriceK) && criteria.minPriceK.length != 0)
            title += ">$" + criteria.minPriceK + "K, ";
        else if (Utils.isDefinedAndNotNull (criteria.maxPriceK) && criteria.maxPriceK.length != 0)
            title += "<$" + criteria.maxPriceK + "K, ";

        if (Utils.isDefinedAndNotNull (criteria.minBedrooms) && criteria.minBedrooms > 0)
            title += criteria.minBedrooms + "+ bed, ";

        if (Utils.isDefinedAndNotNull (criteria.zipCodes) && criteria.zipCodes.length != 0)
            title += "zips " + criteria.zipCodes + ", ";

        // cleanup
        if (title.substr (title.length - 2) == ", ")
            title = title.substr (0, title.length - 2);

        if (title.length == 0)
            title = "Empty search";

        return title;
    };

    var getBookmarkLink = function (criteria)
    {
        var url = location.href;

        if ((Utils.isDefinedAndNotNull (criteria.minPriceK) && criteria.minPriceK > 0)
            || (Utils.isDefinedAndNotNull (criteria.maxPriceK) && criteria.maxPriceK > 0)
            || (Utils.isDefinedAndNotNull (criteria.minBedrooms) && criteria.minBedrooms > 0)
            || (Utils.isDefinedAndNotNull (criteria.zipCodes) && criteria.zipCodes.length > 0)
            || (Utils.isDefinedAndNotNull (criteria.mlsStr) && criteria.mlsStr.length > 0))
        {
            var copy = JSON.parse (JSON.stringify (criteria));
            delete copy.mls; // redundant
            url += "?" + $.param (copy);
        }

        return url;
    };

    return {
        addOrUpdateBookmark: function (criteria)
        {
            createOrGetBookmarkFolder (function (folderId)
            {
                var title = getBookmarkTitle (criteria);
                var url = getBookmarkLink (criteria);

                createOrGetBookmark (folderId, title, function (node)
                {
                    if (typeof node == "undefined" || node == null)
                    {
                        chrome.bookmarks.create ({ parentId: folderId, title: title, url: url }, function () {
                            notificationService.displayNotification ("", "Bookmark created", title);
                        });
                    }
                    else
                    {
                        chrome.bookmarks.update (node.id, { url: url }, function () {
                            notificationService.displayNotification ("", "Bookmark updated", title);
                        });
                    }
                });
            });
        }
    };
});