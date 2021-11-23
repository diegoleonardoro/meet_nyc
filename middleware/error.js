const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {

    let error = { ...err }; // we are creating a copy of the error object with the spread operator "..."
    error.message = err.message;

    // Log to console for dev
    console.log(err.errors); // err contains a bunch information about the type of error



    // Mongoose bad object id error: 
    if (err.name === "CastError") { // err.name is one of the properties of the error object. 
        // "CastError" is an error that appears every time a record is not found.
        // we will send this error if it matched "CastError"
        const message = `Record with id ${err.value} not found`;
        error = new ErrorResponse(message, 404);
    }

    // Monggose duplciate key error. (in the database schema I have to specify the values that I want to be unique )
    if (err.code === 11000) { // err.code 11000 means that there was a duplicate. This error won't apply because I do not have any unique values in my schema.
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }


    // Mongoose validation error (a required field was not included)
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message); // Here we are getting the message property of err object 
        error = new ErrorResponse(message, 400);

    }


    res.status(error.statusCode || 500).json({

        sucess: false,
        error: error.message || "server error"

    });



};

module.exports = errorHandler;





