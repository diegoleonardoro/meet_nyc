const mongoose = require("mongoose");

const RealEstateSchema = new mongoose.Schema({

    communityBoard: Number,

    propetyPrice: Number, // Need to edit it in the fields of the data submitted

    propertyType: String, // Need to add it to the fields of the data that is being submitted,

    address: String, // Need to add it

    zoning: String,

    // Addresses are going to be related to the inputs, so we need to add a reference:
    input: {// This field lets us do the reverse population using virtuals, as it lets us use a middleware located in the Inputs schema, which will populate the submitted record in to the Input schema. 
        type: mongoose.Schema.ObjectId,
        ref: 'Inputs',
        required: true
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }

})


// --- --- --- --- --- --- --- --- --- --- --- //
// Static method to get the avg of property prices
RealEstateSchema.statics.getAverageCost = async function (inputId) { // This function receives the id of the input sent by the client.
    //we'll call this static method inside  .post("save");

    //Aggregation:
    const obj = await this.aggregate([ // We are calling aggregate which is a mongoose method on this model. 
        // Pipeline:
        {
            $match: { input: inputId } // We are going to match the "input" field of .this schema, and get all RealEstateVars whose matches the id that is passed by the client. 
            /*
            --->>>The $match stage filters out documents that don't match the given filter parameter, similar to filters for Mongoose's find()
            */

        },
        {
            $group: {// this is the object that we want to create, the calculted object. It will include:

                // ---->>> $group after $match lets us group all real estate variables whose "input" fiels is equal to "inputId"(the id of the Input that owns the real estate vars ) 

                _id: '$input', // This "input" is being taken from the RealEstateSchema, and it refers to the id of the input that owns this record 
                avgPropertyPrice: { $avg: '$propetyPrice' } // "propertyPrice" is the field of .this schema (RealEstateVars) that we want to average. 

                //---->>> $avg will let us calcualte the average of property prices

            }
        }
    ])
    //console.log(obj); // "obj" is an object with the id of the bootcamp and the average propertyPrice

    try {// This try/catch will include the average property price in to the Inputs schema
        await this.model('Inputs').findByIdAndUpdate(inputId, {
            averagePropertyPriceInArea: Math.ceil(obj[0].avgPropertyPrice / 10) * 10 // ---> we are including the average property price to the Input schema.
        });
    } catch (err) {
        console.error(err);
    }
}
// --- --- --- --- --- --- --- --- --- --- --- //







// --- --- --- --- --- --- --- --- --- --- --- // Every time a new real estate record is submitted, the  getAverageCost middleware will be used 
// Call getAverageCost after save
RealEstateSchema.post("save", function () {
    this.constructor.getAverageCost(this.input); // We need to call this in the actual model, and since we are in the model, we will use "this.constructor 1*"
})
// --- --- --- --- --- --- --- --- --- --- --- //



// --- --- --- --- --- --- --- --- --- --- --- //
// Call getAverageCost before remove
RealEstateSchema.pre("remove", function () {
    this.constructor.getAverageCost(this.input); // If also want to do the calculation, when we remove a real estate var record.
})
// --- --- --- --- --- --- --- --- --- --- --- //






module.exports = mongoose.model("RealEstateVars", RealEstateSchema);


/*
In Mongoose:

RealEstateSchema.goFish() ---->> static ( we define a method inside the schema ).

const realestate = RealEstateSchema.find();
realestate.goFish() ----->> method.

*/



/*
    1*

    All objects (with the exception of objects created with Object.create(null)) 
    will have a constructor property. 
    
    Objects created without the explicit use of a constructor function (such as object- and array-literals) 
    will have a constructor property that points to the Fundamental Object constructor type for that object.





    -----++> getAverageCost:

    * getAverageCost() is going to be called after we save to the database and after we delete from the database.

    * It will take the "input" of the record that we are trying to save or delete, 
    this "input" represents the id of the Input that owns this real estate vars record 

    * It will create an object that uses the "agregate" method of mongoose 





*/