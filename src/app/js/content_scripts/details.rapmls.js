/*
 * Content script for http://dayton.rapmls.com listing details page
 * scrapes detailed MLS data
 */

"use strict";

function parseDollarAmount (str, listing, propertyName) {
    if (!Utils.isDefinedAndNotNull (str)) {
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

function processRoomDimensionRows (listing) {
    if (!Utils.isDefinedAndNotNull (listing)) return;

    if (!Utils.isDefinedAndNotNull (listing.record))
        listing.record = {};

    if (!Utils.isDefinedAndNotNull (listing.record.rooms))
        listing.record.rooms = [];
    
    var dimRegex = new RegExp ("[0-9]+x[0-9]+");
    var rows = $("a:contains('Room Dimensions')").parent ().parent ().siblings ().filter (function (idx, tr) { return dimRegex.test ($ (tr).text ()); });

    var levelRegex = new RegExp ("Level:\\s*([^\\s]+)");

    for (var i = 0; i < rows.length; i++) {
        var row = $(rows[i]);
        var room = {};
        if (row.children ().length >= 1)
            room.name = $(row.children ()[0]).text ();
        if (row.children ().length >= 2) {
            var t = $(row.children()[1]).text();
            dimRegex.lastIndex = 0;
            room.dimensions = dimRegex.exec (t)[0];
            var sqft = 1;
            var dims = room.dimensions.split ("x");
            for (var j = 0; j < dims.length; j++)
                sqft *= parseInt(dims[j]);
            room.sqft = sqft;
            levelRegex.lastIndex = 0;
            room.level = $(levelRegex.exec (t)).get (1);
        }
        if (typeof room.name !== "undefined" && room.name !== null) {
            var nextRowName = row.next ().children ("td").first ().text ();
            if (nextRowName === room.name + " Desc.") {
                row = row.next ();
                if (row.children ().length >= 2) {
                    room.name = $(row.children ()[1]).text ();
                }
            }
        }
        if ((typeof room.level === "undefined" || room.level === null)
            && (room.name === "Entrance"))
            room.level = "1";
        listing.record.rooms.push (room);
    }
}

function getMls () {
    var summaryTable = $("#tdListingSummary").parent ().next ().children ().first ().children ().first ().children ();
    var firstSummaryBlock = summaryTable.children ().first ().children ().first ().children ().first ();

    // mls
    var mlsStr = firstSummaryBlock.children ().first ().text ();
    return S($(mlsStr.split ("#")).last ()[0]).trim ().s;
}

function updateMlsData () {

    var listing = {
        record: {
            refreshed: new Date ().toJSON ()
        }
    };
    
    var summaryTable = $("#tdListingSummary").parent ().next ().children ().first ().children ().first ().children ();
    var firstSummaryBlock = summaryTable.children().first().children().first().children().first();
    
    // mls
    var mlsStr = firstSummaryBlock.children().first().text();
    listing.record.mls = S($(mlsStr.split ("#")).last ()[0]).trim ().s;
    listing.id = listing.record.mls;
    
    // list price
    listing.record.listPrice = parseInt (new RegExp ("\\$([0-9,]+)").exec (firstSummaryBlock.find (":contains('(LP)')").last ().text ())[1].replace (",", ""));

    // listingDate
    var listingDate = summaryTable.children ().first ().children ().first ().children ().first ().siblings ().first ().children ().first ().siblings ().first ().children ().first ().siblings ().last ().prev ().text ();
    if (listingDate.length > 2)
        listingDate = listingDate.substr (1, listingDate.length - 2);
    listing.record.listingDate = new Date (listingDate).toJSON ();
    
    // sqft
    listing.record.sqft = parseInt (new RegExp ("[0-9]+").exec ($("a:contains('Sq Ft')").parent ().parent ().text ()));
    
    // lot sz
    listing.record.lotSize = new RegExp ("Lot Sz: ([^\\s]+)").exec ($("a:contains('Lot Sz')").parent ().parent ().text ())[1];

    // remarks
    // skip this, can't reliably detect
    
    // subdivision
    listing.record.subdivision = $("a:contains('Subdivision')").parent ().siblings ().first ().text ();
    
    // country
    listing.record.county = $("a:contains('County')").parent ().siblings ().first ().text ();
    
    // taxes/hoa/assessments
    parseDollarAmount ($("a:contains('Semi Annual Taxes')").parent ().siblings ().first ().text (), listing.record, "semiAnnualTaxes");
    parseDollarAmount ($("a:contains('HOA/Condo Fee')").parent ().siblings ().first ().text (), listing.record, "hoaFee");
    parseDollarAmount ($("a:contains('Assessments')").parent ().siblings ().first ().text (), listing.record, "assessments");

    // school district
    listing.record.schoolDistrict = $("a:contains('School District')").parent ().siblings ().first ().text ();

    // room dimensions
    processRoomDimensionRows (listing);

    // images
    var scriptText = $("form[name='InputForm']").children ("table").first ().find ("table").first ().find ("script").first ().text ();
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

        listing.record.pictures = [];
        var length = Math.min (picUrlCodes.length, picDescCodes.length);
        for (var i = 0; i < length; i++)
        {
            var pic = {};
            pic.url = codeRegex.exec (picUrlCodes[i])[1];
            codeRegex.lastIndex = 0; // reset codeRegex
            pic.description = codeRegex.exec (picDescCodes[i])[1];
            codeRegex.lastIndex = 0; // reset codeRegex
            listing.record.pictures.push (pic);
        }
    }
    
    chrome.runtime.sendMessage ({ action: "processListing", listing: listing }, function (resultAndListing) {
        var message = "N/A";
        if (resultAndListing.result === -1)
            message = "1 new";
        else if (resultAndListing.result === 0)
            message = "1 unchanged";
        else if (resultAndListing.result === 1)
            message = "1 updated";
                
        chrome.runtime.sendMessage ({
            action: "displayNotification",
            id: "",
            title: "Scrape Results",
            message: message
        });
    });

    chrome.runtime.sendMessage ({ action: "getMlsDetailsFetchList" }, function (mlsNums) {
        if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length === 0)
            return;

        var idx = $.inArray (listing.record.mls, mlsNums);
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

    chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
        if (request.action === "getCanScrape") {
            sendResponse (true);
            return true;
        }
        
        if (request.action === "scrape") {
            updateMlsData ();
        }

        console.log ("Don't know how to to handle request: " + request);

        return false;
    });

    chrome.runtime.sendMessage ({ action: "getMlsDetailsFetchList" }, function (mlsNums) {
        if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length === 0)
            return;

        var idx = $.inArray (getMls (), mlsNums);
        if (~idx)
            updateMlsData ();
    });
});