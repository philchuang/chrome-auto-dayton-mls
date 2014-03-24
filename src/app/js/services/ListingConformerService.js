"use strict";

/*
 * ensures listing objects are consistent, clean, and migrated
 */
app.factory ("listingConformerService", function () {

    var migrateToListingRecord = function (listing, propName, newPropName) {
        if (!Utils.isDefinedAndNotNull (listing)
            || !Utils.isDefinedAndNotNull (listing[propName]))
            return;

        if (!Utils.isDefinedAndNotNull (listing.record))
            listing.record = {};

        if (!Utils.isDefinedAndNotNull (newPropName))
            newPropName = propName;

        listing.record[newPropName] = listing[propName];
        delete listing[propName];
    };
    
    var migrateToListingPersonal = function (listing, propName, newPropName) {
        if (!Utils.isDefinedAndNotNull (listing)
            || !Utils.isDefinedAndNotNull (listing[propName]))
            return;

        if (!Utils.isDefinedAndNotNull (listing.personal))
            listing.personal = {};

        if (!Utils.isDefinedAndNotNull (newPropName))
            newPropName = propName;

        listing.personal[newPropName] = listing[propName];
        delete listing[propName];
    };

    var migrate = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        if (!Utils.isDefinedAndNotNull (listing.record)) {
            modified = true;
            migrateToListingRecord (listing, "mls");
            migrateToListingRecord (listing, "timestamp", "refreshed");
            migrateToListingRecord (listing, "isStale");
            migrateToListingRecord (listing, "listingDate");
            migrateToListingRecord (listing, "listPrice");
            migrateToListingRecord (listing, "bedrooms");
            migrateToListingRecord (listing, "bathrooms");
            migrateToListingRecord (listing, "sqft");
            migrateToListingRecord (listing, "lotSize");
            migrateToListingRecord (listing, "yearBuilt");
            migrateToListingRecord (listing, "listingType");
            migrateToListingRecord (listing, "status");
            migrateToListingRecord (listing, "streetNumber");
            migrateToListingRecord (listing, "streetName");
            migrateToListingRecord (listing, "city");
            migrateToListingRecord (listing, "zip");
            migrateToListingRecord (listing, "description");
            migrateToListingRecord (listing, "mainImageUrl");
            migrateToListingRecord (listing, "subdivision");
            migrateToListingRecord (listing, "county");
            migrateToListingRecord (listing, "semiAnnualTaxes");
            migrateToListingRecord (listing, "hoaFee");
            migrateToListingRecord (listing, "assessments");
            migrateToListingRecord (listing, "schoolDistrict");
            migrateToListingRecord (listing, "rooms");
            migrateToListingRecord (listing, "pictures");
        }

        if (!Utils.isDefinedAndNotNull (listing.personal)) {
            modified = true;
            migrateToListingPersonal (listing, "score");
            migrateToListingPersonal (listing, "isFavorite");
            migrateToListingPersonal (listing, "isHidden");
            migrateToListingPersonal (listing, "personalNotes", "notes");
        }

        return modified;
    };

    var deleteHashKey = function (obj) {
        if (!Utils.isDefinedAndNotNull (obj)) return false;

        if (angular.isArray (obj)) {
            var modified = false;

            for (var i = 0; i < obj.length; i++)
                if (deleteHashKey (obj[i]))
                    modified = true;

            return modified;
        } else {
            if (!Utils.isDefinedAndNotNull (obj.$$hashKey)) return false;
            delete obj.$$hashKey;
            return true;
        }
    };

    var cleanse = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        if (typeof listing.lastUpdate !== "undefined") {
            delete listing.lastUpdate;
            modified = true;
        }
        if (typeof listing.annualTaxes !== "undefined") {
            delete listing.annualTaxes;
            modified = true;
        }
        if (typeof listing.numRooms !== "undefined") {
            delete listing.numRooms;
            modified = true;
        }
        if (typeof listing.streetNameAndNumber !== "undefined") {
            delete listing.streetNameAndNumber;
            modified = true;
        }
        if (typeof listing.streetNumberAndName !== "undefined") {
            delete listing.streetNumberAndName;
            modified = true;
        }
        if (typeof listing.roomDimensions !== "undefined") {
            delete listing.roomDimensions;
            modified = true;
        }
        if (typeof listing.calculated !== "undefined") {
            delete listing.calculated;
            modified = true;
        }

        // delete $$hashKey (gets added somehow)
        if (deleteHashKey (listing))
            modified = true;

        if (Utils.isDefinedAndNotNull (listing.history))
        {
            if (deleteHashKey (listing.history))
                modified = true;

            // delete "added" messages
            for (var i = 0; i < listing.history.length; i++)
            {
                if (listing.history[i].action.indexOf ("added") === 0) {
                    listing.history.splice (i, 1);
                    i--;
                    modified = true;
                    continue;
                }
            }
        }

        if (Utils.isDefinedAndNotNull (listing.record.pictures))
        {
            if (deleteHashKey (listing.record.pictures))
                modified = true;
        }

        if (Utils.isDefinedAndNotNull (listing.record.rooms))
        {
            if (deleteHashKey (listing.record.rooms))
                modified = true;
        }

        return modified;
    };

    var conform = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        // make sure user data is present
        if (!Utils.isDefinedAndNotNull (listing.personal))
            listing.personal = {};

        if (!Utils.isDefinedAndNotNull (listing.personal.isFavorite)) {
            listing.personal.isFavorite = false;
            modified = true;
        }

        if (!Utils.isDefinedAndNotNull (listing.personal.isHidden)) {
            listing.personal.isHidden = false;
            modified = true;
        }

        if (!Utils.isDefinedAndNotNull (listing.personal.score)) {
            listing.personal.score = 0;
            modified = true;
        }
        
        // make sure some record data is present
        if (!Utils.isDefinedAndNotNull (listing.record.isStale)) {
            listing.record.isStale = false;
            modified = true;
        }

        if (!Utils.isDefinedAndNotNull (listing.record.subdivision)) {
            listing.record.subdivision = null;
            modified = true;
        }

        return modified;
    };
    
    return {

        conform: function (listing) {
            var modified = migrate (listing);
            modified = cleanse (listing) || modified;
            modified = conform (listing) || modified;
            return modified;
        }

    };
});