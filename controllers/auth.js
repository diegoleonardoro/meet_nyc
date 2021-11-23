const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const crypto = require("crypto");


//@desc     Register user
//@route    POST /auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    //Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    })

    // Crate and send token
    sendTokenResponse(user, 200, res);// This function will send a token to the client bases on his _id and the JWT_SECRET value. 
})
//^^ Create an interface that will make a post request to this ^^^ route.






//@desc     Login user 
//@route    POST /auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and passwrod', 400));
    }

    // Check for user 
    const user = await User.findOne({ email }).select("+password"); // we need to use .select("+password") because in the user shcema we set the password fiel to select: false which doesn't return and password when it is requested 

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    };


    // Check if password matches
    // To validate the password, we need to take the passed password and match it to the encrupted password
    const isMatch = await user.matchPassword(password);// .matchPassword was a method defined in the User schema and it compares the password sibmitted by the client to the hashed password in the database. If they are the same, then isMath will be set to true. 

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    };

    // Crate and send token
    sendTokenResponse(user, 200, res);


    // the token is being sent to the client, and a lot of the times we would store that token 
    // in a local storage and when we make a request to a protective route,
    // the token would be taken from the local storage, put in the header and sent 
    // to that protective route. 

    // storing that token in local storage can have some security issues.
    // so we are going to send a cookie to the client with the token in it,
    // so that the token can be stored in the browser cookies and we do not 
    // have to send it with every request 

})


//@desc     Log user out / clear cookie 
//@route    GET /auth/logout 
//@access   Private
exports.logout = asyncHandler(async (req, res, next) => {

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    /*
    The res.cookie() function is used to set the cookie name to value. 
    The value parameter may be a string or object converted to JSON.

    res.cookie(name, value [, options])

    Parameters: The name parameter holds the name of the cookie and 
    the value parameter is the value assigned to the cookie name. 
    The options parameter contains various properties like encode, 
    expires, domain, etc
    */

    res.status(200).json({
        success: true,
        data: {}
    })


})



//@desc     Get current logged in user  
//@route    POST /auth/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
    // since we are using the protect middleware on this route, then we are able to access "req.user" which contains all the information about the user
    // req.user will alway be the logged in user

    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    })
})




//@desc     Update user details  
//@route    PUT /auth/updatedetails
//@access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {

    // we will only update the name and the email, which will be sent by the client on the body.
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })

})



//@desc     Update password   
//@route    POST /auth/updatepassword
//@access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

    // The user will send the current password and the new password in the body. 
    // select the user from the data base using the id and return the password 
    const user = await User.findById(req.user.id).select("+password");

    // Compare the password submitted by the client to the one that is in the database
    if (!(await user.matchPassword(req.body.currentPassword))) { // .matchPassword() is a function from the User schema, and it uses a bcrypt function called "compare" which compares the password entered by the client to the hashed password that is in the database. It returns true or false depending on whether the password matches. 
        return next(new ErrorResponse('Password is incorrect', 401));
    }


    user.password = req.body.newPassword;
    await user.save();


    sendTokenResponse(user, 200, res); // we will send a token so that the user can stay logged in. 


})













//@desc     Forgot password  
//@route    POST /auth/forgotpassword
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // Get user from data base by email
    const user = await User.findOne({ email: req.body.email }); // req.body.email is found in the Body
    // when we get this user, it won't contain the password field because in the schema we set the password field to "select: false"


    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    const resetToken = user.getResetPasswordToken(); //  .getResetPasswordToken() is a function that we called on the user schema.
    // .getResetPasswordToken() is going to give values to the "resetPasswordToken" 
    // and the "resetPasswordExpire" fields of the user schema
    // and it will return "resetToken"


    await user.save({ validateBeforeSave: false });//1* in the schema the password field is required when the user register, but when the user forgot its password we won't get the password field, so in order to save the user without password we use "validateBeforeSave: false"
    /*
    . save() Saves this document by inserting a new document into the database if document.isNew is true,
    or sends an updateOne operation only with the modifications to the database, 
    it does not replace the whole document in the latter case.
    */

    // Create reset url with token 
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has 
    requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;


    try {
        await sendEmail({ // The sendEmail function takes in email, subject and message. This function uses the nodemailer module 
            email: user.email,
            subject: 'Password reset token',
            message
        });
        res.status(200).json({ sucess: true, data: 'Email sent' });
    } catch (err) {

        // If something goes wrong, we are going to want to get rid of the "resetPasswordToken" and 
        // "resetPasswordExpire" fields from the User schema.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be send ', 500));

    }



    /*
    1*
    By default, documents are automatically validated before they are saved to the database. 
    This is to prevent saving an invalid document. 
    If you want to handle validation manually, 
    and be able to save objects which don't pass validation, you can set validateBeforeSave to false.
    */

})





//@desc     Reset password  
//@route    PUT /auth/resetpassword/:resettoken
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

    // Get hashed token 
    // We need to hash the token sent by the user so we can compare it to the one that is in the database 
    const resetPasswordToken = crypto.
        createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');


    const user = await User.findOne({ // We will find the user in the data base based on the token (after hashing it)that's in the url and also the "resetPasswordExpire" 
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() } // "gt" is a mongoose operator which means "greater than".
    })

    if (!user) {
        return next(new ErrorResponse('Inalid token', 404));
    }

    // set new password 
    user.password = req.body.password; // the user sent the new password in the body, and before we save it in the data base we will encrypt it. 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save(); // When we save the user, the new password will be ecrypted.



    sendTokenResponse(user, 200, res); // Once the user gets his new password, we'll send a token because they'll be logged in.
    // sendTokenResponse() will send the token as a cookie, which will be necessary to be able to let the user stay logged in. 

})



















// ......-------......-------......-------......-------......-------......-------......-------......-------......-------
// -----........-----........-----........-----........-----........-----........-----........-----........-----........
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => { // user is a representation of the user schema.
    // Create token
    const token = user.getSignedJwtToken(); // getSignedJwtToken() is a funciton in the User schema that creates the token. 
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // ---> This represents 30 days
        httpOnly: true // This lets us make the cookie available only to the client side script
    };

    /*
    we can set the secure cookies option to true if the environment is set to 'production':
    // --- .... --- .... --- .... --- 
    if(process.env.NODE_ENV==='production'){
        options.secure = true;
    }
    // --- .... --- .... --- .... ---
    */
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}
// ......-------......-------......-------......-------......-------......-------......-------......-------......-------
// -----........-----........-----........-----........-----........-----........-----........-----........-----........
// ......-------......-------......-------......-------......-------......-------......-------......-------......-------


