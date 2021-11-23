const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => { // ----> to use this method, we need to add it the route that we want to protect as a first parameter  

    // This middleware is going to be in charge of checking that the user that is trying to 
    // access a protected route has the correct token (is loged in).  


    // console.log(req.headers.cookie.split('token='));

    let token;

    //token = req.headers.cookie.slice(17)

    token = req.headers.cookie.split('token=')[1];


    //console.log('hola tu....')


    //console.log('token from auth', token);
    //console.log('========================================')

    //token = req.headers.cookie.split(';')[1].slice(7)




    //console.log(req.headers.cookie.split(';')[1])

    //====================================================================================
    //if (
    //    req.headers.authorization &&// ---> Here we are cheking if there is an authorization header 
    //    req.headers.authorization.startsWith('Bearer') // ---> in the headers, the token is sent with the "authorization" key and it starts with the word "Bearer"
    //) {
    //    // Set token from a Bearer token in header
    //    token = req.headers.authorization.split(' ')[1];
    //    console.log(token)
    //}
    //====================================================================================

    //====================================================================================

    // Set token from a cookie
    // else if (req.cookies.token) { // This else if allows us to send the token as a cookie 
    //    console.log("lolissss"); 
    //   token = req.cookies.token;
    //} 

    //====================================================================================



    // Make sure token exists
    if (!token) {
        //console.log('1')
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // console.log(token);

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Here we are verifying that the token sent by the client matches the the JWT_SECRET value that we set on the config env variables.
        // (the token includes the 'user id' encrypted )
        //console.log(decoded); // Once verified, decoded is going to have an id value, which is the id belonging to the client trying to login, and which we'll use to get the user from the database.

        req.user = await User.findById(decoded.id).populate('input'); // ======>>>>>----->>>>>  req.user is being set to the user from the database whose id field matches decoded.id 
        // req.user will always be the currently logged user.
        // In any route where we use the "protect" middleware we will have access to "req.user".

        // console.log('2')
        next();// this 'next' will call the next middleware 

    } catch (err) {
        // console.log('3')
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

})


// Grant access to specific roles
exports.authorize = (...roles) => { // The roles that are passed to this function in the routes file are the only ones that will be able to access that route. The "role" sent by the client be included in this "roles" array if he/she wants to access that route. 
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            // console.log('4')
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`,
                403
            ));
        }
        //console.log('4')
        next();
    }
}



