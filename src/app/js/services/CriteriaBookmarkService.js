"use strict";

/*
 * handles bookmarks for search criteria
 */
app.factory ("criteriaBookmarkService", function (browserBookmarkService, browserNotificationService) {

    var createOrGetBookmarkFolder = function (folderIdCallback)
    {
        browserBookmarkService.search ("Dayton MLS searches").then (function (nodes)
        {
            if (!Utils.isDefinedAndNotNull (nodes) || nodes.length === 0)
            {
                browserBookmarkService.create ({ title: "Dayton MLS searches" }).then (function (node) {
                    folderIdCallback (node.id);
                });
                return;
            }
            folderIdCallback (nodes[0].id);
        });
    };

    var createOrGetBookmark = function (folderId, title, nodeCallback)
    {
        browserBookmarkService.getChildren (folderId).then (function (nodes)
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
                var title = Utils.getCriteriaDescription (criteria);
                var url = getBookmarkLink (criteria);

                createOrGetBookmark (folderId, title, function (node)
                {
                    if (typeof node == "undefined" || node == null)
                    {
                        browserBookmarkService.create ({ parentId: folderId, title: title, url: url }).then (function () {
                            browserNotificationService.displayNotification ("", "Bookmark created", title);
                        });
                    }
                    else
                    {
                        browserBookmarkService.update (node.id, { url: url }).then (function () {
                            browserNotificationService.displayNotification ("", "Bookmark updated", title);
                        });
                    }
                });
            });
        }
        
    };
});