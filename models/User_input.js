const mongoose = require("mongoose");
const slugify = require("slugify"); // A slug is a part of the URL when you are accessing a resource.
const geocoder = require("../utils/geoCoder");


/*  HERE I NEED TO CREATE ALL THE FIELDS THAT ARE GOING TO GO IN THE QUESTIONNAIRE */

// some of the labels in the following section can be found both in the residential and the commercual sections, such as:
// currentRelationToPlace
// relationToPlaceLength



const neighborhoodSatisfactionSchema = mongoose.Schema({
    publicTransportation: String,
    publicSpaces: String,
    neighbors: String,
    restaurants: String,
    safety: String
})

const neighborhoodFactorDescriptionSchema = mongoose.Schema({
    publicTransportationExplanation: String,
    publicSpacesExplanation: String,
    neighborsExplanation: String,
    restaurantsVarietyExplanation: String,
    safetyExplanation: String
})


const favoritePlacesSchema = mongoose.Schema({
    place: String,
    description: String,
    coordinates: Object,
    numberOfPhotos: Number,
    placeImage: [{
        data: Buffer,
        contentType: String,
        coordinates: String
        //type: String,
        //default: 'no-photo.jpg'
    }]
})



const InputSchema = new mongoose.Schema({

    neighborhood: String,

    borough: String,

    lengthLivingInNeighborhood: String,

    neighborhoodDescription: String,

    threeWordsToDecribeNeighborhood: [String],

    neighborhoodSatisfaction: {
        type: neighborhoodSatisfactionSchema
    },
    neighborhoodFactorDescription: {
        type: neighborhoodFactorDescriptionSchema
    },
    favoritePlaces: {
        type: [favoritePlacesSchema]
    },
    neighborhoodTips: [String],

    moreSelfIntroduction: String,


    user: { // This lets us have a user associated with an Input.
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        // required: true // <<<<--- when removed, the data imports
        // Originally, for a user to be able to post a new record, he/she has to 
        // be looged in. In order to check if the user is logged in, we used the 
        // protect middleware, which checks for the id of the user. 
    }







    /*
        userName: {
            type: String,
            //required: [true, "Please add user name"]
        },
    
    
        address: {
            type: String,
            //required: [true, "Please add address"]
        },
    
        borough: String, /// <<<< add this field in the form 
    
        location: {
            type_: String,
            coordinates: [Number],
            formattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String,
        },
    
    
        image: {
    
            data: Buffer,
            contentType: String
            //type: String,
            //default: 'no-photo.jpg'
        },
    
        averagePropertyPriceInArea: Number,
    
        averageRating: Number,
    
        slug: String,
    
        propertyType: String,
    
        currentRelationToPlace: String,
    
    
    
        seeYourselfLivingThere: String,
    
        someoneElseLivesOrLivedThere: String,
    
        relationToPlaceLength: String,
    
    
    
        placeRelationshipSatisfaction: String,
    
        relationshipToPerson: String,
    
        relevanceOfPlace: String,
    
        reasonForSatisfaction: String,
    
        someonelseInformation: String,
    
        resonNotLivingThereAnymore: String,
    
        relatedPersonStillLivesThere: String,
    
        explanationFutureLivingThere: String,
    
        stillLivesInNeighborhood: String,
    
        relatedPersonWillLiveInThatPlace: String,
    
        whyRelatedPersonNotThere: String,
    
        ownOrRent: String,
    
        newAddress: String,
    
        whereRelatedPersonNowLiving: String,
    
        reasonRelatedPersonFutureInPlace: String,
    
         Liker scale values: 
    
        neighborhoodSatisfactValue: {
            //Currently lives there
            nghbrhdSatisfactionPublicTransport: String,
    
            nghbrhdSatisfactionPublicSpaces: String,
    
            nghbrhdSatisfactionNeighbors: String,
    
            nghbrhdSatisfactionNoise: String,
    
            nghbrhdSatisfactionGreenSpaces: String,
    
            // Used to live there
            betterPublicTransInNewNeighborhood: String,
    
            betterPublicSpacesInNewNeighborhood: String,
    
            betterNeighborRelationsInNewNeighborhood: String,
    
            betterSafetyInNewNeighborhood: String,
    
            betterGreenSpacesInNewNeighborhood: String,
    
    
            // Someone else used to live there
            otherPersonBetterPublicTransInNewNeighborhood: String,
    
            otherPersonBetterPublicSpacesInNewNeighborhood: String,
    
            otherPersonBetterNeighborRelationsInNewNeighborhood: String,
    
            otherPersonBetterSafetyInNewNeighborhood: String,
    
            otherPersonBetterGreenSpacesInNewNeighborhood: String,
    
            // Someone else lives there
            otherPersonPublicTransporSatisfactionLevel: String,
    
            otherPersonPublicSpacesSatisfactionLevel: String,
    
            otherPersonNeighborsSatisfactionLevel: String,
    
            otherPersonNoiseSatisfactionLevel: String,
    
            otherPersonGreenSpacesSatisfactionLevel: String,
    
        },
    
    
    
    
    
        justification of choices in likert scale
        // He/she lives there
    
    
        likertScaleJustification: {
    
            justifyPublicTransportSatisfaction: String,
    
            justifyPublicSpacesSatisfaction: String,
    
            justifyNeighborsRelationSatisfaction: String,
    
            justifyNoiseSatisfaction: String,
    
            justifyGreenSpacesSatisfaction: String,
    
            // He/she now lives in a different place
    
            justifyPublicTransSatisfactCurrentVsPrevNeigh: String,
    
            justifyPublicSpacesSatisfactCurrentVsPrevNeigh: String,
    
            justifyNeighborsRelationsSatisfactCurrentVsPrevNeigh: String,
    
            justifySafetySatisfactCurrentVsPrevNeigh: String,
    
            justifyGreenSpacesSatisfactCurrentVsPrevNeigh: String,
    
            // Other person used to live there
    
            justifyOtherPersonPublicTransSatisfactCurrentVsPrevNeigh: String,
    
            justifyOtherPersonPublicSpacesSatisfactCurrentVsPrevNeigh: String,
    
            justifyOtherPersonNeighborsRelatnsSatisfactCurrentVsPrevNeigh: String,
    
            justifyOtherPersonSafetySatisfactCurrentVsPrevNeigh: String,
    
            justifyOtherPersonGreenSpacesSatisfactCurrentVsPrevNeigh: String,
    
            // Other person lives in that place
    
            justifyOtherPersonPublicTransportSatisfact: String,
    
            justifyOtherPersonPublicSpacesSatisfact: String,
    
            justifyOtherPersonNieghborsSatisfact: String,
    
            justifyOtherPersonNoiseSatisfact: String,
    
            justifyOtherGreenSpacesSatisfact: String,
    
    
        },
    
    
        //====================================//
        //====================================//
        //====================================//
        //====================================//
    
        Exclusively commercial options :  
    
        typeOfBussiness: String,
    
        favoriteThingAboutPlace: String,
    
        // likert scale options, which  will be called only from "what type of business do you operate here?"
    
        currentRentFair: String,
    
        rentHasIncreasedFairly: String,
    
        WillBeAbleToKeepUpWithRentInFuture: String,
    
        hasGoodRelationWithLandLord: String,
    
    
        Justification of choices in likert scale 
    
        whyStrongDisagreeRentFair: String,
    
        whyDisagreeRentFair: String,
    
        whyNeutralRentFair: String,
    
        whyAgreeRentFair: String,
    
        whyStrongAgreeRentFair: String,
    
        //---
    
        whyStrongDisagreeRentIncrementFair: String,
    
        whyDisagreeRentIncrementFair: String,
    
        whyNeutralRentIncrementFair: String,
    
        whyAgreeRentIncrementFair: String,
    
        whyStrongAgreeRentIncrementFair: String,
    
        //---
    
    
        whyStrongDisagreeWillKeepUpWithRent: String,
    
        whyDisagreeWillKeepUpWithRent: String,
    
        whyNeutralWillKeepUpWithRent: String,
    
        whyAgreeWillKeepUpWithRent: String,
    
        whyStrongAgreeWillKeepUpWithRent: String,
    
        //---
    
        whyStrongDisagreeGoodRelationWithLandlord: String,
    
        whyDisagreeGoodRelationWithLandlord: String,
    
        whyNeutralGoodRelationWithLandlord: String,
    
        whyAgreeGoodRelationWithLandlord: String,
    
        whyStrongAgreeGoodRelationWithLandlord: String,
    
        //------------------//
    
        seeYrslfOpertingBsnsInFuture: String,
    
        whyDontOwnBussinessAnymore: String,
    
        thinkBusinessWillRemainThere: String,
    
        whyNotRegularOfPlaceAnymore: String,
    
        whyThinkWillBeOprtngBsnssInFuture: String,
    
        whyThinkWontBeOprtngBsnssInFuture: String,
    
        operateBsnssElsewhere: String,
    
        whyThinkBsnssWillBeThereInFutre: String,
    
        whyThinkBsnssWontBeThereInFutre: String,
    
        bsnssOperatingElseWhere: String,
    
        bsnssNewLocation: String,
    
        listBusinessChallenges: String,
    
        whereOwnBsnssNowOperates: String,
    
        whatTypeOfBsnssOperatesNow: String,
    
        favThingAboutBussiness: String,
    
        whatWasFavThingAboutBussiness: String,
    
        //----------------
        placeDescription: String,
        //----------------
    
        */



}

    //, {
    //       toJSON: { virtuals: true },
    //        toObject: { virtuals: true }
    //    });


    // create the input slug from the name:
    //InputSchema.pre("save", function (next) { 
    //    this.slug = slugify(this.address, { lower: true });
    //    next();
    //}

);




// Geocode & create location field:

//=================================================================================//
/* 
InputSchema.pre("save", async function (next) {
    //const address = this.address + " New York, NY";
    //onsole.log(address);
    const loc = await geocoder.geocode(this.address); // here we make use of node-geocoder, which takes in an address and returns all the following fields: 
    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcoce: loc[0].zipcode,
        country: loc[0].countryCode
    }

    // Now we do not need to save the addres field from the schema because we are saving it in the above object. By setting it to undefined, it won't be put into the database. 
    this.address = undefined;
    next();
})
*/
//=================================================================================//





// Cascade delete real estate vars when a place is deleted 
//InputSchema.pre("remove", async function (next) { // This middleware deletes the real estate variables of the place that is deleted. In order for it to work, we need to change the DELETE method present in controllers ----> inputs.js
//        console.log(`Real estate variables removed from place ${this._id}`);
//        await this.model("RealEstateVars").deleteMany({ input: this._id });
//        // "this.model("RealEstateVars")" refers to the RealEstateVars schema without having to import it. 
// "input: this._id" refers to the input field in the RealEstateVars schema and we are passing the id thar was sent by the client. 
//        next();
//    })






// Reverse populate with virtuals
// We create this virtual because every time a real estate var is created, we want to insert it into the inputs 
//InputSchema.virtual('realEstateVars', {
// In this virtual, all the records in the 'realEstateVars' schema whose "input" field is the same as the "_id" field in the pertaining 'Input' schema reocord, are going to be inserted here. 
//    ref: 'RealEstateVars', // reference to the model that we are going to be using
//    localField: '_id',
//    foreignField: "input",
// localField and foreignField need to match so that the correct real estate variables are added to the correct input. 

//    justOne: false // this will let us get a array in case there more than one real estate vars related to a specific site, 
//})





module.exports = mongoose.model('Inputs', InputSchema);


/*

 VIRTUALS:

 In Mongoose, a virtual is a property that is not stored in MongoDB. 
 Virtuals are typically used for computed properties on documents.

    const userSchema = mongoose.Schema({
    email: String
    });

    // Create a virtual property `domain` that's computed from `email`.
    userSchema.virtual('domain').get(function() {
    return this.email.slice(this.email.indexOf('@') + 1);
    });

    const User = mongoose.model('User', userSchema);

    let doc = await User.create({ email: 'test@gmail.com' });
    // `domain` is now a property on User documents.
    doc.domain; // 'gmail.com'

 */