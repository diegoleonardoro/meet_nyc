const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title for the review"],
        maxlength: 100
    },

    text: {
        type: String,
        required: [true, "Please add some text"]
    },

    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add a rating between 1 and 10"]
    },


    // Reviews are going to be related to a specific Input and User:
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

// Prevent user from submitting more than one review
ReviewSchema.index({ input: 1, user: 1 }, { unique: true }) // "input" and "user" should only have one unique value in the ReviewSchema




// --- --- --- --- --- --- --- --- --- --- --- //
// Static method to get the avg rating for places 
ReviewSchema.statics.getAverageRating = async function (inputId) { // This function receives the id of the input sent by the client.
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

                // ---->>> $group after $match lets us group all the reviews whose "input" field is equal to "inputId"(the id of the Input that owns the real estate vars ) 

                _id: '$input', // This "input" is being taken from the review schema, and it refers to the id of the input that owns this review 
                avgRating: { $avg: '$rating' } // "rating" is the field of .this schema (RealEstateVars) that we want to average. 

                //---->>> $avg will let us calcualte the average of property prices

            }
        }
    ])

    //console.log(obj); // "obj" is an object with the id of the bootcamp and the average propertyPrice
    try {// This try/catch will include the average property price in to the Users schema.
        await this.model('Inputs').findByIdAndUpdate(inputId, {
            averageRating: obj[0].avgRating // ---> we are including the average property price to the Input schema.
        });
    } catch (err) {
        console.error(err);
    }
}
// --- --- --- --- --- --- --- --- --- --- --- //





// --- --- --- --- --- --- --- --- --- --- --- // Every time a review is submitted, the getAverageRating middleware will be used 
// Call getAverageRating after save
ReviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.input); // We need to call this in the actual model, and since we are in the model, we will use "this.constructor"
})
// --- --- --- --- --- --- --- --- --- --- --- //



// --- --- --- --- --- --- --- --- --- --- --- //
// Call getAverageRating before remove
ReviewSchema.pre("remove", function () {
    this.constructor.getAverageRating(this.input); // If also want to do the calculation, when we remove a real estate var record.
})
// --- --- --- --- --- --- --- --- --- --- --- //



module.exports = mongoose.model("Reviews", ReviewSchema);