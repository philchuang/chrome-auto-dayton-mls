'use strict';

var criteriaUtils = criteriaUtils || {
    updateMls: function (criteria) {
        if (typeof criteria.mlsStr == "undefined" || criteria.mlsStr == null) {
            criteria.mls = [];
            return;
        }
        criteria.mls = criteria.mlsStr.split(",");
        if (criteria.mls.length == 1 && S(criteria.mls[0]).trim().s == "")
        {
            criteria.mls = [];
        }
        else
        {
            for (var i = 0; i < criteria.mls.length; i++)
            {
                criteria.mls[i] = S(criteria.mls[i]).trim().s;
            }
        }
    }
}

/*
function getUrlCriteriaAndExecute ()
{
	if (location.search.length == 0) return;

	chrome.tabs.getCurrent (function (tab) {
		var criteria = jQuery.deparam (location.search.substr (1));
		setForm (criteria);
		chrome.extension.getBackgroundPage ().searchDaytonRapmls (criteria, tab);
	});
}
*/

app.controller("SearchController",
    function SearchController($scope, storageService, searchService, criteriaBookmarkService) {
        // TODO detect URL params and immediately execute search

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