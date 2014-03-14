/*
 * Content script for http://dayton.rapmls.com listing details page
 */

"use strict";

function parseDollarAmount (str, listing, propertyName) {
    if (typeof str === "undefined" || str === null) {
        str = "";
    }

    str = S(str).trim().s;

    if (str.length > 0 && str[0] === "$")
        str = str.substr (1);

    var val = parseFloat (str);

    if (isNaN (val)) {
        delete listing[propertyName];
        return;
    }

    listing[propertyName] = val;
}

function updateMlsData () {

    var listing = {
        timestamp: new Date ().toJSON ()
    };
    
    var summaryTable = $("#tdListingSummary").parent ().next ().children ().first ().children ().first ().children ();
    
    // mls
    var mlsStr = summaryTable.children ().first ().children ().first ().children ().first ().children ().first ().text ();
    listing.mls = S($(mlsStr.split ("#")).last ()[0]).trim ().s;
    listing.id = listing.mls;

    // listingDate
    var listingDate = summaryTable.children ().first ().children ().first ().children ().first ().siblings ().first ().children ().first ().siblings ().first ().children ().first ().siblings ().last ().prev ().text ();
    if (listingDate.length > 2)
        listingDate = listingDate.substr (1, listingDate.length - 2);
    listing.listingDate = new Date(listingDate).toJSON();
    
    // taxes/hoa
    parseDollarAmount ($("a:contains('Semi Annual Taxes')").parent().siblings().first().text(), listing, "semiAnnualTaxes");
    parseDollarAmount ($("a:contains('HOA/Condo Fee')").parent().siblings().first().text(), listing, "hoaFee");

    // images
    var scriptText = $("form[name='InputForm']").children("table").first().find("table").first().find("script").first().text();
    var picUrlRegex = new RegExp ("Pic\\[[0-9]+\\] = \"(http.+?)\";", "gim");
    var picDescRegex = new RegExp ("PicDescription\\[[0-9]+\\] = \"(.*?)\";", "gim");
    var picUrlCodes = scriptText.match (picUrlRegex);
    var picDescCodes = scriptText.match (picDescRegex);

    if (picUrlCodes === null || picDescCodes === null)
    {
        console.log ("No pictures found");
    }
    else
    {
        if (picUrlCodes.length != picDescCodes.length)
            console.log ("Warning: found "+picUrlCodes.length+" pictures and "+picDescCodes.length+" descriptions.");

        var codeRegex = new RegExp (" = \"(.*)\";", "gim");

        listing.pictures = [];
        var length = Math.min (picUrlCodes.length, picDescCodes.length);
        for (var i = 0; i < length; i++)
        {
            var pic = {};
            pic.url = codeRegex.exec (picUrlCodes[i])[1];
            codeRegex.lastIndex = 0; // reset codeRegex
            pic.description = codeRegex.exec (picDescCodes[i])[1];
            codeRegex.lastIndex = 0; // reset codeRegex
            listing.pictures.push (pic);
        }
    }
    
    chrome.runtime.sendMessage({ action: "processListing", listing: listing }, function (_) {});

    chrome.runtime.sendMessage ({ action: "getMlsDetailsFetchList" }, function (mlsNums) {
        if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length === 0)
            return;

        var idx = $.inArray (listing.mls, mlsNums);
        if (~idx) {
            mlsNums.splice (idx, 1);
            chrome.runtime.sendMessage ({ action: "saveMlsDetailsFetchList", mlsNums: mlsNums });
            window.history.back ();
        }
    });
}

$(document).ready (function ()
{
    if ($("#tdListingSummary").length === 0)
        return; // not on the details page

    // currently not used
    //chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
    //    if (request.action == "scrape") {
    //        handleScrapeOptions (request.options);
    //        sendResponse (true);
    //    }
    //    else
    //    {
    //        console.log ("Don't know how to to handle request: " + request);
    //    }
    //});

    updateMlsData ();
});