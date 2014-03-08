"use strict";

var criteriaUtils = criteriaUtils || {
    updateMls: function (criteria) {
        if (typeof criteria.mlsStr == "undefined" || criteria.mlsStr == null) {
            criteria.mls = [];
            return;
        }
        criteria.mls = criteria.mlsStr.split (",");
        if (criteria.mls.length == 1 && S (criteria.mls[0]).trim ().s == "") {
            criteria.mls = [];
        } else {
            for (var i = 0; i < criteria.mls.length; i++) {
                criteria.mls[i] = S (criteria.mls[i]).trim ().s;
            }
        }
    }
};

app.controller("SearchController",
    function ($scope, $window, storageService, searchService, criteriaBookmarkService) {
        // TODO detect URL params and immediately execute search

        // $location.search() isn't working right, so use $window.location.search
        if ($window.location.search.length != 0)
        {
            chrome.tabs.getCurrent (function (tab) {
                var criteria = jQuery.deparam ($window.location.search.substr (1));
                criteriaUtils.updateMls (criteria);
                $scope.criteria = criteria;
                searchService.searchDaytonRapmls (criteria, tab);
            });
        }

        $scope.criteria = {};

        storageService.getLastCriteria().then (function (criteria) {
            if (criteria != null) {
                $scope.criteria = criteria;
            }
        });

        $scope.executeSearch = function (criteria) {
            criteriaUtils.updateMls (criteria);
            searchService.searchDaytonRapmls(criteria);
        };

        $scope.bookmarkSearch = function (criteria) {
            criteriaUtils.updateMls(criteria);
            criteriaBookmarkService.addOrUpdateBookmark(criteria);
        };

    });