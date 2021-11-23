const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const Inputs = require("../models/User_input");
const asyncHandler = require("../middleware/async");
const geoCoder = require("../utils/geoCoder");
const fs = require('fs');
const User = require("../models/User");


//const upload = require("../middleware/imageUpload");





//@desc     Gets the input interface
//@route    GET /
//@access   Public
exports.getInterface = (req, res, next) => {

    res.render("index.html") //<== here, we are rendering "index.html" every time we get a "get" request for the base route. 
    res.status(200).json({ success: true });
    res.end();

}



//@desc     Gets all inputs 
//@route    GET /inputs
//@access   Public
exports.getInputs = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults); // We are able to access advancedResults because we are using this middleware in the GET route. The "advancedResults" returns an object with all the information that we want to send to the client. 
})






// @desc    Gets one single input
// @route   GET /inputs/:id 
// @access  Public
exports.getInput = asyncHandler(async (req, res, next) => {// in this function I will render the ejs file 

    // req.params comes from path segments of the URL that match a parameter in the route definition such a /song/:songid.
    // req.body properties come from a form post where the form data (which is submitted in the body contents) has been parsed into properties of the body tag.
    //console.log(req.params);// this logs the id of the user.
    //console.log('method from inputs/id:', req.method);


    console.log('id: ', req.params.id)

    const input = await Inputs.findById(req.params.id).populate({
        path: 'user'
    });


    if (!input) {
        return next(
            new ErrorResponse(`Record with id ${req.params.id} not founde`, 404)
        )
    }




    //--------------------------------------------------------//
    // convert image received as Buffer to its original format;
    const image = input.image.data.buffer
    const imageDataBuffer = Buffer.from(image, "base64");

    //const bufferBuffer = input.image.data.buffer.buffer
    //const imageUint8View = new Uint8Array(image);
    //const rawBuffer = image.toString("base64")
    //const buff = new Buffer(image);
    //const buffToString = image.toString("buff")
    //const imageData = input.image.data.buffer.data;



    const imageSrc = "data:image/png;base64," + imageDataBuffer.toString("base64");// the one 


    /* 
    //--------------------------------------------------------//
    // Add line break to the place description:
    var placeDescrpn = input.placeDescription;
    let flag = 28;
    let placeDescrpnSpaced = '';// Here we will inject <br>
    let placeDescrpRaw = ''; // text without <br>
    let placeDescrForArray = ''
    let placeDescrArray = [];
    for (let i = 0; i < placeDescrpn.length; i++) { // we'll enter here the length of placeDescrpnSpaced
        placeDescrpRaw = placeDescrpRaw + placeDescrpn[i]; // text without <br> this is used to trach the length of the text that we iterate 
        placeDescrpnSpaced = placeDescrpnSpaced + placeDescrpn[i];// Here we will inject <br>
        placeDescrForArray = placeDescrForArray + placeDescrpn[i];
        if (placeDescrpRaw.length >= flag && placeDescrpnSpaced.charAt(placeDescrpnSpaced.length - 1) === ' ') {// We will enter this if statement when 
            placeDescrArray.push(placeDescrForArray)
            placeDescrpnSpaced = placeDescrpnSpaced + '<br>';
            flag = flag + 32;
            placeDescrForArray = '';
        }
    }
    //--------------------------------------------------------//
    const userValues = {
        userName: input.userName,
        coordinates: input.location.coordinates,
        photo: input.photo,
        placeDescription: placeDescrArray,
        imageSrc: imageSrc,
        neighborhoodSatisfactValue: input.neighborhoodSatisfactValue,
        propertyType: input.propertyType,
        currentRelationToPlace: input.currentRelationToPlace,
        relationToPlaceLength: input.relationToPlaceLength,
        neighborhoodSatisfactification: [
            input.justifyNeighborsRelationSatisfaction,
            input.justifyPublicTransportSatisfaction,
            input.justifyPublicSpacesSatisfaction,
            input.justifyNoiseSatisfaction,
            input.justifyGreenSpacesSatisfaction
        ]
    }
    */





    res.render("userInputs", { userValues });



})


// @desc    Gets all inputs 
// @route   GET /inputs/allInputs
// @access  Public

exports.getAllInputs = asyncHandler(async (req, res, next) => {



    const inputs = await Inputs.find({}, 'location image placeDescription');

    let inputsFiltered = []
    for (var i = 0; i < inputs.length; i++) {

        // conver the image in database into a Buffer
        let image = inputs[i].image.data.buffer
        let imageDataBuffer = Buffer.from(image, "base64");
        //-------------------------------------------

        // split the place description 
        var placeDescrpn = inputs[i].placeDescription;
        let flag = 28;
        let placeDescrpnSpaced = '';// Here we will inject <br>
        let placeDescrpRaw = ''; // text without <br>
        let placeDescrForArray = ''
        let placeDescrArray = [];
        for (let i = 0; i < placeDescrpn.length; i++) { // we'll enter here the length of placeDescrpnSpaced
            placeDescrpRaw = placeDescrpRaw + placeDescrpn[i]; // text without <br> this is used to trach the length of the text that we iterate 
            placeDescrpnSpaced = placeDescrpnSpaced + placeDescrpn[i];// Here we will inject <br>
            placeDescrForArray = placeDescrForArray + placeDescrpn[i];

            if (placeDescrpRaw.length >= flag && placeDescrpnSpaced.charAt(placeDescrpnSpaced.length - 1) === ' ') {// We will enter this if statement when 
                placeDescrArray.push(placeDescrForArray)
                placeDescrpnSpaced = placeDescrpnSpaced + '<br>';
                flag = flag + 32;
                placeDescrForArray = '';
            }
        }

        console.log(placeDescrArray)
        console.log('----------------------------------------------')
        //------------------------------------------




        inputsFiltered.push({
            'location': inputs[i].location,
            'imageSrc': "data:image/png;base64," + imageDataBuffer.toString("base64"),
            'placeDescription': placeDescrArray//////
        })
    }

    res.render("all_inputs", { inputsFiltered });

})









//@desc     Post a single input 
//@route    POST /inputs/userId
//@access   Private
exports.createInput = asyncHandler(async (req, res, next) => {

    console.log('createInput')


    //console.log(req.body);
    //console.log(req.files);

    req.body.neighborhoodSatisfaction = JSON.parse(req.body.neighborhoodSatisfaction);
    req.body.neighborhoodFactorDescription = JSON.parse(req.body.neighborhoodFactorDescription);
    req.body.favoritePlaces = JSON.parse(req.body.favoritePlaces)


    //console.log(req.body.threeWordsToDecribeNeighborhood);
    //console.log('===========================================')
    //console.log(JSON.parse(req.body.neighborhoodSatisfaction));
    //console.log('===========================================')
    //console.log(JSON.parse(req.body.neighborhoodFactorDescription));
    //console.log('===========================================')
    //console.log(JSON.parse(req.body.favoritePlaces));
    //console.log('===========================================')
    //console.log(req.body.neighborhoodTips);
    //console.log('===========================================')


    /*
    1. Get the user id from req.params.id and add it to req.body:
    req.body.user = req.params.userId
            ^^^^^ this 'user' was created in the Inputs model


    2. Find the user with user id that comes in the url:
    const user = await User.findById(req.params.userId)

    3. Check if the user exists:
    if(!user){
        return next(
            new ErrorResponse(`No user with the id of ${req.params.id}`),
            404
        );
    }
    4. Create the input including the user id that was passed in the url:
    const input = Input.create (req.body) -> this includes the user id

    */

    var favoritePlaces = req.body.favoritePlaces;

    //console.log(favoritePlaces);
    //console.log(req.body.neighborhoodFactorDescription);
    //console.log('=================================================================')
    //console.log(JSON.parse(req.body.neighborhoodFactorDescription));
    // console.log('=================================================================')
    //console.log(neighborhoodFactorsDesciption);


    for (var i = 0; i < favoritePlaces.length; i++) {

        let photoArray = []
        let numOfPhotos = favoritePlaces[i].numberOfPhotos;

        for (var h = 0; h < numOfPhotos; h++) {
            photoArray.push({
                data: fs.readFileSync('/Users/diegoleoro/inputs_nyc/uploads/' + req.files[h].filename),
                contentType: 'image/png'
            })
        }

        favoritePlaces[i]['placeImage'] = photoArray;
    }

    req.body.favoritePlaces = favoritePlaces;
    req.body.user = req.user.id;


    //console.log(req.body);

    //console.log(req.body.favoritePlaces[0]['placeImage'][0]);

    //data.user = req.user.id;
    //delete data.placeImage;

    /*
    neighborhood
    lengthLivingInNeighborhood
    placeImage
    neighborhoodSatisfaction
    neighborhoodFactorsDesciption
    favoritePlaces
    publicTransportationTips
    safetyTips
    */

    //obj['image'] = {
    //    data: fs.readFileSync('/Users/diegoleoro/inputs_nyc/uploads/' + req.file.filename),
    //    contentType: 'image/png'
    //}

    //const obj = JSON.parse(JSON.stringify(req.body));
    //const location = JSON.parse(req.body.location);
    //obj.location = location;
    //const satisfactScale = JSON.parse(req.body.neighborhoodSatisfactValue);
    // obj.neighborhoodSatisfactValue = satisfactScale;
    // const satisfactScaleJustification = JSON.parse(req.body.likertScaleJustification)
    // obj.likertScaleJustification = satisfactScaleJustification;

    //JSON.stringify(req.body.location)
    //Object.values(req.body.location);
    //Object.values(data)

    //==========================================================================================//
    // Add user to req.body
    //req.body.user = req.user.id; // In the "protect" middleware, we created "req.user" and gave it the values of the User that was in the data base and which is trying to access this route. 
    //()
    //  "user" is a field in our "Inputs" schema which we will use to start creating relations between user and created Inputs
    // Check for any Input published by the user that is trying to access this route

    //const publishedInput = await Inputs.findOne({ user: req.params.id });
    // If the user is not an adming, they can only publish one Input
    /* 
    if (publishedInput && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `The user with id ${req.user.id} has already published a bootcamp`,
                400
            )
        )
    }
    */
    //==========================================================================================//

    // If there was an image uploaded, then do something:
    // if (req.photo) {
    //const file = req.files.files;
    //Create custom file name:
    //file.name = `photo_${path.parse(file.name).ext}`;
    //    console.log(req.photo);
    // }
    //==========================================================================================//
    //console.log(req.body);// this prints all the fields perfectly except for the image.
    // The way the image field is being created is the gforgeeks tutorial is by reading the image for the 
    // the upload folder:
    /*
     img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
    }
    */

    //console.log(req.body);

    const input = await Inputs.create(req.body);
    const user = await User.findByIdAndUpdate({ _id: req.user.id }, { formResponded: '1' }).populate('input')


    //.updateOne({ formResponded: '1' });
    //.updateOne({ formResponded: '1' });


    sendTokenResponse(user, 200, res);



    // res.status(201).json({
    //     success: true,
    //     data: input
    // })
    //res.end()
    /* 
    res.render("all_inputs", { inputs });
    */

})






// @desc     Update input
// @route    PUT /inputs/:id 
// @access   Private
exports.updateInput = asyncHandler(async (req, res, next) => {

    //try {
    let input = await Inputs.findById(req.params.id);

    if (!input) {
        return next(
            new ErrorResponse(`Record with id ${req.params.id} not founde`, 404)
        )
    }

    // Make sure user is Input owner
    if (input.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp`,
                401
            )
        );
    };

    input = await Inputs.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({ sucess: true, data: input });

})


// @desc    Delete input
// @rouse   DELETE  /inputs/:id
// @access  Private 
exports.deleteInput = asyncHandler(async (req, res, next) => {
    // Inside the Inputs schema, there is a pre "remmove" middleware which deletes records from the realEstateVars model that fulfill: { input: this._id }
    const input = await Inputs.findById(req.params.id); // change "findByIdAndDelete" to "findById" so that the middleware present in models -> User_input.js, and which deletes real estate vars when a place in deleted, works 

    if (!input) {
        return next(
            new ErrorResponse(`Record with id ${req.params.id} not founde`, 404)
        )
    }

    // Make sure user is Input owner
    if (input.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to delete this bootcamp`,
                401
            )
        );
    };

    input.remove();
    res.status(200).json({ sucess: true, data: {} });

})



// @desc    Get inputs withing a radious 
// @rouse   GET  /inputs/radious/:zipcode/:distance
// @access  Private 
exports.getInputsInRadious = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params; // we get these two values from the url sent by the client 

    // Get lat and lon from geocoder 
    const loc = await geoCoder.geocode(zipcode); // geoCoder lets us do reverse geo coding: from addresses to coordinates 
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radious using radians
    // Divide dist by radius of Earth 
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963; // distance is the distance in miles whithing which the the client wants to see the places. 

    const inputs = await Inputs.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } // $centerSphere Defines a circle for a geospatial query that uses spherical geometry. The query returns documents that are within the bounds of the circle. You can use the $centerSphere operator on both GeoJSON objects and legacy coordinate pairs.
    })

    res.status(200).json({
        success: true,
        count: inputs.length,
        data: inputs
    })
})




// @desc    Upload photo for place
// @rouse   PUT  /inputs/:id/photo
// @access  Private 
exports.placePhotoUpload = asyncHandler(async (req, res, next) => {
    const input = await Inputs.findById(req.params.id);
    if (!input) {
        return next(
            new ErrorResponse(`Record with id ${req.params.id} not found`, 404)
        )
    }



    // Make sure user is Input owner
    if (input.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp`,
                401
            )
        );
    };




    if (!req.files) {
        return next(
            new ErrorResponse(`Please upload a file`, 400)
        )
    }

    const file = req.files.file;

    // Make sure the the file is photo 
    if (!file.mimetype.startsWith('image')) { //all image files will start with "image" in their mimetype section  
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
            400
        ));
    }


    // Create custom file name 
    file.name = `photo_${input._id}${path.parse(file.name).ext}` // In this method we are uploading a photo to an existing input record, because it already exists, we can access its "_id" field and use it to create the file name. 

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => { // //Use the mv() method to place the file in upload directory

        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Inputs.findByIdAndUpdate(req.params.id, {
            photo: file.name
        })

        res.status(200).json({
            success: true,
            data: file.name
        })

    }) // .mv is a function in the file that help us save the image in a folder. The first argument that it takes in the path where we want to save the file. 

})








const sendTokenResponse = (user, statusCode, res) => {

    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // ---> This represents 30 days (time beyond which the token will expire)
        httpOnly: true // This lets us make the cookie available only to the client side script
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })

    return token;
}