"use strict";

/*
 * ensures listing objects are consistent, clean, and migrated
 */
app.factory ("listingConformerService", function () {
    
    var migrate = function (listing) {
        var modified = false;

        if (!Utils.isDefinedAndNotNull (listing)) return modified;

        // nothing here right now

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