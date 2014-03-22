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

    var migrate = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        return false; // not ready to test the rest yet

        if (!Utils.isDefinedAndNotNull (listing.record)) {
            modified = true;
            migrateToListingRecord (listing, "mls");
            migrateToListingRecord (listing, "timestamp", "refreshed");
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

        return modified;
    };

    var cleanse = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        // delete $$hashKey (gets added somehow)

        if (Utils.isDefinedAndNotNull (listing.history))
        {
            for (var i = 0; i < listing.history.length; i++)
            {
                if (typeof listing.history[i].$$hashKey !== "undefined")
                {
                    delete listing.history[i].$$hashKey;
                    modified = true;
                }
            }
        }

        if (Utils.isDefinedAndNotNull (listing.pictures))
        {
            for (var i2 = 0; i2 < listing.pictures.length; i2++)
            {
                if (typeof listing.pictures[i2].$$hashKey !== "undefined")
                {
                    delete listing.pictures[i2].$$hashKey;
                    modified = true;
                }
            }
        }

        return modified;
    };

    var conform = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        // make sure user data is present
        if (!Utils.isDefinedAndNotNull (listing.isFavorite)) {
            listing.isFavorite = false;
            modified = true;
        }

        if (!Utils.isDefinedAndNotNull (listing.isHidden)) {
            listing.isHidden = false;
            modified = true;
        }

        if (!Utils.isDefinedAndNotNull (listing.score)) {
            listing.score = 0;
            modified = true;
        }

        if (typeof listing.subdivision === "undefined") {
            listing.subdivision = null;
            modified = true;
        }

        return modified;
    };
    
    return {

        conform: function (listing) {
            var modified = migrate (listing);
            modified |= cleanse (listing);
            modified |= conform (listing);
            return modified;
        }

    };
});