"use strict";

/*
 * handles chrome bookmarks
 */
app.factory ("browserBookmarkService", function ($q) {

    return {
        search: function (text) {
            var deferred = $q.defer ();
            chrome.bookmarks.search (text, function (nodes) {
                deferred.resolve (nodes);
            });
            return deferred.promise;
        },

        getChildren: function (folderId) {
            var deferred = $q.defer ();
            chrome.bookmarks.getChildren (folderId, function (nodes) {
                deferred.resolve (nodes);
            });
            return deferred.promise;
        },
        
        create: function (options) {
            var deferred = $q.defer ();
            chrome.bookmarks.create (options, function (node) {
                deferred.resolve (node);
            });
            return deferred.promise;
        },
        
        update: function (nodeId, options) {
            var deferred = $q.defer ();
            chrome.bookmarks.update (nodeId, options, function () {
                deferred.resolve ();
            });
            return deferred.promise;
        }
    };

});