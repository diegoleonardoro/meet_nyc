const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Input = require ('../models/User_input')


const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },

    role: {
        type: String,
        enum: ['user', 'publisher'],// publishers are able to post a place. Users are able to see those places and contact the publisher
        default: 'user'
    },

    password: {
        type: String,
        required: [true, "Please add passwird"],
        minlength: 6,
        select: false // with "select:false" whenever we get a user through the API, the API won't return the password
    },

    formResponded: String, 

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }


}, {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });



/*

A middleware runs automatically.

a method runs when we call it. 

*/

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {

    // This method will hash the password submitted by the client and store it in the "password" field of the User schema.
    // In order for this method to run there has to be a value in the password field 

    // isModified Returns true if any of the given paths is modified, else false
    if (!this.isModified('password')) {// If the password was not modified, then we will move along and won't execute the next two lines of code 
        next();
    }
    // We only want to get to the next two lines when the password is created or modified.

    const salt = await bcrypt.genSalt(10); // genSalt is a method from "bcrypt"
    this.password = await bcrypt.hash(this.password, salt);   //-------> here we are encrypting the user password

})




// Sign JWT (JSON web token) and return 
UserSchema.methods.getSignedJwtToken = function () { // <<<-- methods are what we get from the model. getSignedJwtToken() is going to give us a token that the user will be able to use to access protected routes. This method will be called when the user registers and when he/she is trying to login.
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { // <<<----- the token is created out of the user id and not the password.
        expiresIn: process.env.JWT_EXPIRE
    })
    // Here we are signing the JWT. Inside it goes the payload. The second argument that it takes is a secrer, which should be kept in the config file in our enviroment variables.
    // .sign also takes an expiresIn argument which sets a time span for the token.
    // this._id pertains to the current user. 
}






// Match user entered password to hashed password in database. We'll do this using bcrypt
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)//>>>>>> the first argument is the password send by the client, the second one is the password that is inside the database. 
    // .matchPassword is a method that will be called in the actual user that was found in the database using the email and the password sent by the client in the >>/auth/login<< route, so we will have access the fields of the found user. 
}





// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set it to resetPassword field
    // As this is a method called on the actual User schema, we can access its fields: this.resetPasswordToken, this.resetPasswordExpire
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // We are setting this to 10 minutes.

    return resetToken;

}


// Cascade delete inputs related to a user that is deleted:
UserSchema.pre('remove', async function (next){
    await this.model ('Input').deleteMany({user:this_.id});
    next();
})



//Reverser populate with virtuals. This is meant to show all inputs associated to a user when there is a request to get all or a single user.
UserSchema.virtual ('input',{
    ref: 'Inputs', 
    localField:'_id', 
    foreignField: 'user', 
    justOne: false
})








module.exports = mongoose.model('User', UserSchema);



// a JWT has three parts to it, which explain why we need to create a token:

// --> first part: algorith and token type
// --> second part: the payload data, whatever we want to send in this token will be in this part. In most cases will be the userId or thigs like that.
// When  the user sends a request with the token, we will know which user that is, that is why we send the userId. The userId can then be used in a mongoose query to get information related to that specific user that the token belongs to.
// --> third part: verifying signature.


// JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact 
// and self-contained way for securely transmitting information between parties 
// as a JSON object. This information can be verified and trusted because it is digitally signed.


// SIGNED TOKENS can verify the integrity of the claims contained within it,
// When tokens are signed using public/private key pairs, 
// the signature also certifies that only the party holding the private key is the one that signed it.


// 3 PARTS OF A JWT:
// ---> header:  two parts: the type of the token, which is JWT, and the signing algorithm being used, such as HMAC SHA256 or RSA
// ---> payload: The second part of the token is the payload, which contains the claims. Claims are statements about an entity (typically, the user) and additional data.
// ---> signature: To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.




// statics are called in the model itself.
// methods are called on what we initialize from the model. 
// For the JWT we need a method

