"use strict";

// this class is currently unused, need to rethink what I want to do with it
app.factory ("listingFactory", function () {

    return {
        
        // creates a new fully-formed Listing
        create: function () {
            return {
                // app data
                id: null,  // same as mls
                // MLS-scraped data
                timestamp: new Date().toJSON(),
                mls: null, // string
                listingDate: null, // JSON'd Date
                listPrice: null, // number
                bedrooms: null, // number
                bathrooms: null, // number
                sqft: null, // number
                lotSize: null, // string
                yearBuilt: null, // number
                listingType: null, // string
                status: null, // string
                streetNumber: null, // string
                streetName: null, // string
                city: null, // string
                zip: null, // string
                description: null, // string
                mainImageUrl: null, // string
                subdivision: null, // string
                county: null, // string
                semiAnnualTaxes: null, // number
                hoaFee: null, // number
                assessments: null, // number
                schoolDistrict: null, // string
                rooms: [],
                pictures: [],
                // user-added data
                isFavorite: false,
                isHidden: false,
                score: 0,
                personalNotes: null // string
            };
        },

        createRoom: function () {
            return {
                name: "",
                dimensions: "",
                sqft: 0,
                level: ""
            };
        },

        createPicture: function () {
            return {
                url: "",
                description: ""
            };
        },

        createHistory: function () {
            return {
                timestamp: new Date ().toJSON (),
                action: null // string
            };
        }
    };

});