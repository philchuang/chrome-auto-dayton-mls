'use strict';

var criteriaCookmarkServiceBase = criteriaCookmarkServiceBase || {

    createOrGetBookmarkFolder: function (folderIdCallback) {
        chrome.bookmarks.search("Dayton MLS searches", function (nodes) {
            if (typeof nodes == "undefined" || nodes == null || nodes.length == 0)
            {
                chrome.bookmarks.create({ title: "Dayton MLS searches" }, function (node) {
                    folderIdCallback(node.id);
                });
                return;
            }
            folderIdCallback(nodes[0].id);
        });
    },

    createOrGetBookmark: function (folderId, title, nodeCallback) {
        chrome.bookmarks.getChildren(folderId, function (nodes) {
            if (typeof nodes != "undefined" && nodes != null && nodes.length > 0)
            {
                for (var i = 0; i < nodes.length; i++)
                {
                    console.log(nodes[i].title);
                    if (nodes[i].title == title)
                    {
                        nodeCallback(nodes[i]);
                        return;
                    }
                }
            }

            nodeCallback(null);
        });
    },

    getBookmarkTitle: function (criteria) {
        var title = "";

        // MLS supercedes all else
        if (criteria.mls && criteria.mls.length > 0)
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
            title += "$" + criteria.minPriceK + "K < $" + criteria.maxPriceK + "K, ";
        else if (criteria.minPriceK.length != 0)
            title += ">$" + criteria.minPriceK + "K, ";
        else if (criteria.maxPriceK.length != 0)
            title += "<$" + criteria.maxPriceK + "K, ";

        if (criteria.minBedrooms.length != 0 && criteria.minBedrooms > 0)
            title += criteria.minBedrooms + "+ bed, ";

        if (criteria.zipCodes.length != 0)
            title += "zips " + criteria.zipCodes + ", ";

        // cleanup
        if (title.substr(title.length - 2) == ", ")
            title = title.substr(0, title.length - 2);

        if (title.length == 0)
            title = "Empty search";

        return title;
    },

    getBookmarkLink: function (criteria) {
        var url = location.href;

        if (criteria.minPriceK.length != 0
            || criteria.maxPriceK.length != 0
            || criteria.minBedrooms.length != 0
            || criteria.zipCodes.length != 0
            || criteria.mls.length != 0)
        {
            url += "?" + $.param(criteria);
        }

        return url;
    }
};

app.factory("criteriaBookmarkService", function (notificationService) {
    return {
        addOrUpdateBookmark: function (criteria) {

            criteriaCookmarkServiceBase.createOrGetBookmarkFolder(function (folderId) {
                var title = criteriaCookmarkServiceBase.getBookmarkTitle(criteria);
                var url = criteriaCookmarkServiceBase.getBookmarkLink(criteria);

                criteriaCookmarkServiceBase.createOrGetBookmark(folderId, title, function (node) {
                    if (typeof node == "undefined" || node == null)
                    {
                        chrome.bookmarks.create({ parentId: folderId, title: title, url: url }, function () {
                            notificationService.displayNotification("bookmark", "Bookmark created", title);
                        });
                    }
                    else
                    {
                        chrome.bookmarks.update(node.id, { url: url }, function () {
                            notificationService.displayNotification("bookmark", "Bookmark updated", title);
                        });
                    }
                });
            });
        }

    };
});