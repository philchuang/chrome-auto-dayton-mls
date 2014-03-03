function setForm (criteria){
	if (typeof criteria == "undefined" || criteria == null)
		criteria = {};

	$("input#minPrice").val(criteria.minPriceK);
	$("input#maxPrice").val(criteria.maxPriceK);
	$("input#bedrooms").val(criteria.bedrooms);
	$("textarea#zipCodes").val(criteria.zipCodes);
	$("textarea#mls").val(S(criteria.mls).toCSV(', ', null));
}

document.addEventListener('DOMContentLoaded', function(){

	chrome.extension.getBackgroundPage().getLastCriteria(function (items) {
		var criteria = items["lastCriteria"];
		setForm(criteria);
	})

	var searchButton = document.getElementById('searchButton');
	searchButton.addEventListener("click", function(){

		var criteria = {};
		criteria.minPriceK = $("input#minPrice").val();
		criteria.maxPriceK = $("input#maxPrice").val();
		criteria.bedrooms = $("input#bedrooms").val();
		criteria.zipCodes = $("textarea#zipCodes").val();
		criteria.mls = $("textarea#mls").val().split(",");
		if (criteria.mls.length == 1 && criteria.mls[0] == "")
			delete criteria.mls;

        chrome.extension.getBackgroundPage().searchDaytonRapmls(criteria);
    });
});