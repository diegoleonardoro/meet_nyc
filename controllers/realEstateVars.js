const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const RealEstateVarsSchema = require('../models/RealEstateVars')
const Inputs = require('../models/User_input');


//@desc     Gets real estate variables
//@route    GET /realEstateVars
//@route    GET /inputs/:placeId/realEstateVars  --> In this route we will access a specific real estate variable using the id of a place 
//@access   Public

exports.getRealEstateVars = asyncHandler(async (req, res, next) => { // This controller is being used for two routes. 
    // This method takes in the id of the place (input)

    if (req.params.placeId) { // Here we are checking if the user sent a placeId. If there is an id in the request parameters, it means that the client only wants to get one single recors, in which case we do not need all the functionality of "advancedResults".
        // if this route /inputs/:placeId/realEstateVars is hit
        const realEstateVars = await RealEstateVarsSchema.find({ input: req.params.placeId });
        return res.status(200).json({
            success: true,
            count: realEstateVars.length,
            data: realEstateVars
        })

    } else { // If the client did not send an id, it means that he/she wants to access all records, in which case we want to apply all the funcitonality of "advancedResults",
        res.status(200).json(res.advancedResults)
    }


})



//@desc     Get single real estate variables
//@route    GET /realEstateVars/:id  // --> in this route we access real estate variables using the id of a specified real estate record
//@access   Public

exports.getSingleRealEstateVars = asyncHandler(async (req, res, next) => {
    //This method takes in the id of the real estate vars.

    const singleRealEstateVars = await RealEstateVarsSchema.findById(req.params.id).populate({ //-----> req.params.id represents the id of the real estate variables record that we would like to get 
        path: 'input', // 'input' was defined in the RealEstateVarsSchema and it references the Inputs Schema. 
        select: 'location.formattedAddress propertyType userName'
    })

    if (!singleRealEstateVars) {
        return next(new ErrorResponse(`No real estate variables found with id of ${req.params.id}`), 404);
    }

    // const realEstateVars = await query;

    res.status(200).json({
        sucsess: true,
        data: singleRealEstateVars
    });

})




//@desc     Add real estate variables to a specific place 
//@route    POST /inputs/:placeId/realEstateVars  -----------> every time we hit the "/:placeId/realEstateVars" in the input_routes, we will be re-routed to the realEstateVars_routes 
//@access   Private
exports.addRealEstateVars = asyncHandler(async (req, res, next) => {

    req.body.input = req.params.placeId; // this is the placeId that was submitted by the client
    //  "input" is an actual field of RealEstateSchema, where we include the id of the place. 

    req.body.user = req.user.id;
    // "user" is a field of the RealEstateSchema 
    // we are getting req.user.if from the "protect" function, where we found the user in the data base with the token submitted by the client. 


    /*
    req.body = what we are going to use to create a new real estate variables
    req.params = what was submitted by the client
    req.user = what we from the "protect" function, and which contains all the information of the logged user trying to post new real estate variables.
    */


    const input = await Inputs.findById(req.params.placeId);

    if (!input) {
        return next(new ErrorResponse(`No place found with id of ${req.params.placeId}`),
            404
        );
    }


    // Make sure user is Input owner
    if (input.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add more real estate variables to place ${input.id}`,
                401
            )
        );
    }


    const realEstateVars = await RealEstateVarsSchema.create(req.body); // this is creating the new record in the RealEstateVarsSchema.  

    res.status(200).json({
        sucsess: true,
        data: realEstateVars
    });


})





//@desc     Update real estate variables 
//@route    PUT /realEstateVars/:id
//@access   Private
exports.updateRealEstateVars = asyncHandler(async (req, res, next) => {
    // This method takes in the id of a real estate vars record 
    let realEstateVars = await RealEstateVarsSchema.findById(req.params.id);

    if (!realEstateVars) {
        return next(
            new ErrorResponse(`No real estate variables found with id of ${req.params.id}`),
            404
        );
    };



    // Make sure that user trying to update this record is the owner
    if (req.user.id !== realEstateVars.user.toString() && req.user.role !== "admin") {
        return next(new ErrorResponse(
            `User with id ${req.user.id} is not allowed to update record with id 
            ${realEstateVars.id}`, 401)
        )
    }





    realEstateVars = await RealEstateVarsSchema.findByIdAndUpdate(req.params.id, req.body, {
        new: true,  // return new version of real estate vars. 
        runValidators: true
    })

    res.status(200).json({
        sucsess: true,
        data: realEstateVars
    });
})



//@desc     Delete real estate variables 
//@route    DELETE /realEstateVars/:id
//@access   Private
exports.deleteRealEstateVars = asyncHandler(async (req, res, next) => {
    // This method takes in the id of a real estate vars record 

    const realEstateVars = await RealEstateVarsSchema.findById(req.params.id);

    if (!realEstateVars) {
        return next(
            new ErrorResponse(`No real estate variables found with id of ${req.params.id}`),
            404
        );
    };



    // Make sure that user trying to delete this record is the owner
    if (req.user.id !== realEstateVars.user.toString() && req.user.role !== "admin") {
        return next(new ErrorResponse(
            `User with id ${req.user.id} is not allowed to update record with id ${realEstateVars.id}`, 401
        ))
    }



    await realEstateVars.remove();

    res.status(200).json({
        sucsess: true,
        data: {}
    });


})
















/*
    1.
    -> populate("{path:input}") lets us get the real estate variables 
    with the corresponding input in the "input" field.
    -> populate(), which lets you reference documents in other collections.
*/




/*
req.query comes from query parameters in the URL such as http://foo.com/somePath?name=ted
where req.query.name === "ted".


req.params comes from path segments of the URL that match a parameter in the route definition 
such a /song/:songid. So, with a route using that designation and a URL such as /song/48586, 
then req.params.songid === "48586".


req.body properties come from a form post where the form data (which is submitted in the body 
contents) has been parsed into properties of the body tag.
*/