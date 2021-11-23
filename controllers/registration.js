const ErrorResponse = require("../utils/errorResponse");
const UserRegistration = require("../models/User");// <<------ registration schema.
const asyncHandler = require("../middleware/async");
const fs = require('fs');
const User = require("../models/User");

var url = require('url');



//@desc     renders the registration templave
//@route    GET /register
//@access   public
exports.Registration_Interface = (req, res, next) => {
    //console.log('conejo');
    //res.send({ message: 'hola from Express' })
    //res.sendFile("registration.html", {root:__dirname})
    res.render("registration") //<== here, we are rendering "index.html" every time we get a "get" request for the base route. 
    //res.status(200).json({ success: true });
    res.end();

}


//@desc     renders the registration templave
//@route    POST /register
//@access   public
exports.register_User = asyncHandler(async (req, res, next) => {

    const user = await User.create(req.body);

    //console.log(user);

    sendTokenResponse(user, 200, res);



    //res.status(201).json({
    //    success: true,
    //    data: user
    //})

})



//@desc     Login user 
//@route    GET /register/login
//@access   Public
exports.login_interface = (req, res, next) => {
    res.render('login')
    res.end();

}





//@desc     Login user 
//@route    POST /register/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and passwrod', 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    };


    //console.log(user);


    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    };



    //console.log(typeof user.formResponded);
    ///console.log(user.formResponded);


    //if (user.formResponded != '1') {
    //    console.log('jijijijij')
    sendTokenResponse(user, 200, res);
    // } else {
    //    res.status(201).json({
    //        success: true,
    //        data: user
    //    })
    // }




})








// ......-------......-------......-------......-------......-------......-------......-------......-------......-------
// -----........-----........-----........-----........-----........-----........-----........-----........-----........
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => { // user is a representation of the user schema.
    // Create token
    const token = user.getSignedJwtToken(); // getSignedJwtToken() is a funciton in the User schema that creates the token. 


    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // ---> This represents 30 days (time beyond which the token will expire)
        httpOnly: true // This lets us make the cookie available only to the client side script
    };


    var flag = user.formResponded;

    if (flag) {
        res
            .status(statusCode)
            .cookie('token', token,  options)
            .json({
                success: true,
                token,
                flag
            })
    } else {
        res
            .status(statusCode)
            .cookie('token', token, options)
            .json({
                success: true,
                token
            })

    }

     return token;

    /*
    we can set the secure cookies option to true if the environment is set to 'production':
    // --- .... --- .... --- .... --- 
    if(process.env.NODE_ENV==='production'){
        options.secure = true;
    }
    // --- .... --- .... --- .... ---
    */




   


}
// ......-------......-------......-------......-------......-------......-------......-------......-------......-------
// -----........-----........-----........-----........-----........-----........-----........-----........-----........
// ......-------......-------......-------......-------......-------......-------......-------......-------......-------
