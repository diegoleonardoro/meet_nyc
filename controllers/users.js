const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const Inputs = require("../models/User_input");





const path = require('path');

//@desc     Get all users
//@route    GET /auth/users
//@access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});


//@desc     Get single user 
//@route    GET /auth/users/:id
//@access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: user
    })

});




//@desc     Get users assosiated to a neighborhood
//@route    GET /users/neighborhood/:neighborhood
//@access   Public
exports.getNeighborhood = asyncHandler(async (req, res, next) => {

    var neighborhood = req.params.neighborhood
    var input = await Inputs.find({ 'neighborhood': neighborhood }).populate({
        path: 'user'
    });

    let responseArray = [];

    for (var i = 0; i < input.length; i++) {

        let responseObject = {};
        responseObject['name'] = input[i]['user']['name'];
        responseObject['lengthLivingInNeighborhood'] = input[i]['lengthLivingInNeighborhood'];
        responseObject['neighborhoodSatisfactionScale'] = input[i]['neighborhoodSatisfaction'];
        responseObject['publicTransportationTips'] = input[i]['publicTransportationTips'];
        responseObject['safetyTips'] = input[i]['safetyTips'];
        responseObject['favAspectsOfNeighborhood'] = input[i]['favAspectsOfNeighborhood'];


        let favPlacesArray = [];
        let favPlacesObject = {};

        for (var u = 0; u < input[i]['favoritePlaces'].length; u++) {

            let favPlace = input[i]['favoritePlaces'][u];

            favPlacesObject['placeDescrption'] = favPlace;
            let imageBuffer = favPlace['placeImage']['data'];
            favPlacesObject['placeImageBuffer'] = Buffer.from(imageBuffer, "base64").toString('base64')

            //imageBuffer.toString('base64')
            //Buffer.from(imageBuffer, "base64")
            //console.log(favPlacesObject['placeImageBuffer'])
            favPlacesArray.push(favPlacesObject);
        }
        responseObject['favoritePlaces'] = favPlacesArray;
        responseArray.push(responseObject);
    }

    // console.log('array: ', responseArray);

    res.status(201).json({
        success: true,
        data: responseArray
    })

    //const input = await Inputs.findById(req.params.id).populate({
    //    path: 'user'
    //});

});




//@dsc      Render the form after the user has logged in
//@route    GET /users/id:
//@access   Private 
exports.getFormInterface = asyncHandler(async (req, res, next) => {


    //console.log(req.cookies.token);

    //var token = req.cookies.token;
    //console.log('token', token)
    //res.render("userForm")
    //return res.sendfile('/public/index.html', { root: __dirname + '/..' });
    //path.join(__dirname, '../public', 'index.html'

    res.sendFile(path.join(__dirname, '../public', 'index3.html'))
    //next()
    //res.render("index.html")
    //res.end();

})



//@dsc      Render the form after the user has logged in
//@route    GET /users/:id/profile
//@access   Private 
exports.userProfile = asyncHandler(async (req, res, next) => {



    let favPlaces = req.user.input[0].favoritePlaces;

    //console.log(favPlaces);
    //console.log(favPlaces[0].placeImage);


    let imagesFormated = []
    for (var i = 0; i < favPlaces.length; i++) {


        let images = [];
        for (var t = 0; t < favPlaces[i].placeImage.length; t++) {

            let img = Buffer.from(favPlaces[i].placeImage[t].data.buffer, 'base64');


            let formated_image

            if (t === 0) {
                formated_image = `<img src="data:image/png;base64,${img.toString("base64")}"/>`;
            } else {
                formated_image = `<img style="display:none;" src="data:image/png;base64,${img.toString("base64")}"/>`;
            }


            images.push(formated_image);

        }

        imagesFormated.push(images)
    }

    //console.log(imagesFormated);

    let livingInNhood;

    if (req.user.input[0].lengthLivingInNeighborhood === 'do not live there') {
        livingInNhood = 'I do not live in this neighborhood, but I know it well enough to take you to the best places.'
    } else {
        livingInNhood = `I have been living in this neighborhood ${req.user.input[0].lengthLivingInNeighborhood},and I know it well enough to take you to the best places.`
    }

    var introduction1 = `Hello! <span class='introHighlight'> My name is ${req.user.name}, and if you want to visit ${req.user.input[0].neighborhood} I can show around</span> . ${livingInNhood}`
    var introduction2 = `<b>I would describe ${req.user.input[0].neighborhood} as follows:</b> `
    var introduction3 = `${req.user.input[0].neighborhoodDescription}`
    var introduction4 = `<b>In three words, I would describe ${req.user.input[0].neighborhood} as:</b>`
    var introduction5 = `${req.user.input[0].threeWordsToDecribeNeighborhood}`.split(',')
    var introduction6 = `Please keep exploring my profile if you want to learn more about ${req.user.input[0].neighborhood}, and get to know New York City like very few visitors do.`

    var intro = [introduction1, [introduction2, introduction3], [introduction4, introduction5], introduction6];

    let user = {
        'name': req.user.name,
        'neighborhood': req.user.input[0].neighborhood,
        'threeWordsToDecribeNeighborhood': req.user.input[0].threeWordsToDecribeNeighborhood,
        'neighborhoodTips': req.user.input[0].neighborhoodTips,
        'neighborhoodDescription': req.user.input[0].neighborhoodDescription,
        'neighborhoodSatisfaction': req.user.input[0].neighborhoodSatisfaction,
        'neighborhoodFactorDescription': req.user.input[0].neighborhoodFactorDescription,
        'favoritePlaces': req.user.input[0].favoritePlaces,
        'lengthLivingInNeighborhood': req.user.input[0].lengthLivingInNeighborhood,
        'imagesFormated': imagesFormated,
        'intro': intro
    }


    res.render("user_profile", { user });


})





//@desc     Create user
//@route    POST /auth/users
//@access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    res.status(201).json({
        success: true,
        data: user
    })
});


//@desc     Update user
//@route    PUT /auth/users/:id
//@access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: user
    })
});



//@desc     Delete user
//@route    DELETE /auth/users/:id
//@access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        data: {}
    })
});






