class ErrorResponse extends Error { // Node.js comes with an Error class. This error class gives you the core functionality of errors, like capturing a stack trace and assigning context data.

    constructor(message, statusCode) {
        super(message); // with super we can control the class the we are extending (Error)
        this.statusCode = statusCode;
    }

}

module.exports = ErrorResponse;

// The extends keyword is used in class declarations or class expressions 
// to create a class that is a child of another class.

