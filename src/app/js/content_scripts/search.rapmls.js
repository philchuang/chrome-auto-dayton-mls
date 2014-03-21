/*
 * Content script for http://dayton.rapmls.com search page
 * executes a search with the given criteria
 */

"use strict";

function setCriteriaAndExecute (criteria)
{
	if (criteria.mls && criteria.mls.length > 0)
	{
		for (var i = 0; i < criteria.mls.length && i < 5; i++)
		{
			$("input[type='text'][name='Listing_Number_"+(i+1)+"']").val (criteria.mls[i]);
		}

		// clear everything else!

		// clear residential
		var residentialCheckbox = $("input[type='checkbox'][name='Prop_Type_RESI']");
		if (typeof residentialCheckbox.prop ("checked") !== "undefined" && residentialCheckbox.prop ("checked"))
			residentialCheckbox.trigger ("click");
		//SetAdditionalCriteraButton(); // this is what the residential checkbox is supposed to call, but is unnecessary
		
		// clear single family
		var singleFamilyCheckbox = $("input[type='checkbox'][name='Prop_Subtype_RESI_0001']");
		if (typeof singleFamilyCheckbox.prop ("checked") !== "undefined" && singleFamilyCheckbox.prop ("checked"))
			singleFamilyCheckbox.trigger ("click");

		// clear price min * $1k
		$("input[type='text'][name='Price_From_M1']").val ("");
		// clear price max * $1k
		$("input[type='text'][name='Price_Thru_M1']").val ("");

		// clear # of bedrooms
		$("select[name='Bedrooms_From']").val ("");

		// clear zip codes
		$("input[type='text'][name='Zip_Fill_In']").val ("");
	}
	else
	{	
		// check residential
		var residentialCheckbox = $("input[type='checkbox'][name='Prop_Type_RESI']");
		if (typeof residentialCheckbox.prop ("checked") === "undefined" || !residentialCheckbox.prop ("checked"))
			residentialCheckbox.trigger ("click");
		//SetAdditionalCriteraButton(); // this is what the residential checkbox is supposed to call, but is unnecessary
		
		// check single family
		var singleFamilyCheckbox = $("input[type='checkbox'][name='Prop_Subtype_RESI_0001']");
		if (typeof singleFamilyCheckbox.prop ("checked") === "undefined" || !singleFamilyCheckbox.prop ("checked"))
			singleFamilyCheckbox.trigger ("click");

		// set price min * $1k
		$("input[type='text'][name='Price_From_M1']").val (criteria.minPriceK);
		// set price max * $1k
		$("input[type='text'][name='Price_Thru_M1']").val (criteria.maxPriceK);

		// set # of bedrooms
		$("select[name='Bedrooms_From']").val (criteria.minBedrooms);

		// set zip codes
		$("input[type='text'][name='Zip_Fill_In']").val (criteria.zipCodes);
	}

	// execute search
	//cpSearch.doSearch('SubmitBtn1'); // this is what the submit button is supposed to call, but is unnecessary
	$("input[type='button'][id='SubmitBtn0']").trigger ("click");
};

$(document).ready (function ()
{
    if ($("#InputForm").length === 0)
        return; // not on the search page

	chrome.runtime.onMessage.addListener (function (request, sender, sendResponse)
    {
		if (request.action === "setCriteriaAndExecute")
		{
			setCriteriaAndExecute (request.criteria);
			sendResponse (true);
		}
		else
		{
			console.log ("Don't know how to to handle request: " + request);
		}
	});

	chrome.runtime.sendMessage ({ "action": "consumeCriteria" }, function (response) {
	    if (response !== null) {
	        setCriteriaAndExecute (response);
	    }
	});
});