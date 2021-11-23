const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require('../models/Review')
const Inputs = require('../models/User_input');



//@desc     Gets all reviews and reviews for a place
//@route    GET /reviews 
//@route    GET /inputs/:placeId/reviews  --> In this route we will access a specific review  using the id of a place 
//@access   Public

exports.getReviews = asyncHandler(async (req, res, next) => { // This controller is being used for two routes. 
    // This method takes in the id of the place (input)
    if (req.params.placeId) {
        // if this route /inputs/:placeId/reviews is hit
        console.log(req.params.placeId);
        const reviews = await Review.find({ input: req.params.placeId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })

    } else { // If the client did not send an id, it means that he/she wants to access all records, in which case we want to apply all the funcitonality of "advancedResults",
        res.status(200).json(res.advancedResults)
    }
})




//@desc     Get a single review 
//@route    GET /reviews/:id
//@access   Public

exports.getReview = asyncHandler(async (req, res, next) => { // This controller is being used for two routes. 

    const review = await Review.findById(req.params.id).populate({

        path: "input", // In the Reviews schema, we defined a field called "input" which is a schema object id that references the Inputs schema
        select: 'location.formattedAddress propertyType userName' // These are the fields that will be included in "review" that will be taken from the Input schema.

    })

    if (!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: review
    })
})



//@desc     Add review
//@route    POST /inputs/:placeId/reviews
//@accesss  Private
exports.addReview = asyncHandler(async (req, res, next) => {

    req.body.input = req.params.placeId;
    req.body.user = req.user.id;
    // "input"  and "user" are  actual fields of Reviews schema, where we include the id of the place and the user
    // req.body will have all the data that is submitted in addition to the "input" and "user" ids
    const input = await Inputs.findById(req.params.placeId);

    if (!input) {
        return next(
            new ErrorResponse(
                `No place with id of ${req.params.placeId}`,
                404
            )
        );
    }

    const review = await Review.create(req.body);

    res.status(201).json({

        sucess: true,
        data: review
    })


})



//@desc     Update review 
//@route    POST /reviews/:id
//@accesss  Private
exports.updateReview = asyncHandler(async (req, res, next) => {


    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(
                `No review with the if of ${req.params.id}`,
                404
            )
        );
    }

    // Make sure review belongs to user or user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User not authorized to update review`,
                401
            )
        );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(201).json({

        sucess: true,
        data: review
    })


})



//@desc     Delete review 
//@route    DELETE /reviews/:id
//@accesss  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {


    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(
                `No review with the if of ${req.params.id}`,
                404
            )
        );
    }

    // Make sure review belongs to user or user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User not authorized to update review`,
                401
            )
        );
    }

    await Review.remove()

    res.status(201).json({
        sucess: true,
        data: {}
    })


})