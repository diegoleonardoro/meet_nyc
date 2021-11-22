const express = require("express");
const bodyParser = require("body-parser");  // This is a MiddleWare. It lets us read and request bodies.
const connectDB = require("./config/db"); // function that connects to the server. 
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const path = require("path");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const ejs = require("ejs");
const multer = require("multer");
const util = require("util");
const cors = require("cors");



var engines = require('consolidate');


// Load env variables:
dotenv.config({ path: './config/config.env' });

// Connect to the database:
connectDB();





const app = express();


//====================================================
//multer middleware

//var storage = multer.diskStorage({
//    destination: (req, file, cb) => {
//        cb(null, "uploads");
//    },
//    filename: (req, file, cb) => {
//        cb(null, file.fieldname + "-" + Date.now())
//    }
//})
//var upload = multer({ storage: storage });
//====================================================

//ejs
//app.engine('html', engines.swig); // take note, using 'html', not 'ejs' or 'pug'..
//app.set('view engine', 'html'); 


app.set("view engine", "ejs");

//app.engine('.html', ejs.renderFile);
//app.set('view engine', 'html');




app.get("/ejs", (req, res) => res.render("userInputs"));



app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));



app.use(cookieParser());


//app.use(express.static("public")); // --->  Here we are poiting to the path where all the static files are located. This allows us to use "index.html" as out root template. 
app.use(express.static(path.join(__dirname, 'public')))



//File uploading 
//app.use(fileupload())


//======================================================//
//======================================================//
//======================================================//
//======================================================//
// storage engine
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

//Init Upload
const uploadFile = multer({
    storage: storage,
})



const upload = async (req, res) => {
    try {
        await uploadFileMiddleware(req, res);
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
};


app.post('/image', uploadFile.single('placeImage'), (req, res) => {
    console.log('holaaaa');
    console.log(req.file);
    console.log(req.body);
    res.end();
});

//app.post('/image', (req, res) => {
//    console.log(req.files) //prints undefined
//})

//======================================================//
//======================================================//
//======================================================//
//======================================================//


// Routes file:
const nyc_inputs = require("./routes/input_routes");
const real_estate_vars = require("./routes/realestatevars_routes");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const register = require('./routes/registration');// <<<---------------------------------------------------------------ADDED 


//(req, res) => {
//   console.log('test')// this prints correctly when doing a request with the fetch api.
//console.log(req.files);

// uploadFileMiddleware(req, res, (err) => {
//    console.log(req.file);
//    res.send('test');
//})
//}


//======================================================//






//multer
//app.use(upload);


// Cookie parser
//app.use(cookieParser());


// dev login middleware:
//if (process.env.NODE_ENV === "development") {
//    app.use(morgan("dev"));
//}

//app.use(function (req, res, next) {
//    res.setHeader(
//        'Content-Security-Policy',
//        "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self' 'http://d3js.org/d3.v4.min.js' 'https://unpkg.com/topojson@3' 'https://js.api.here.com/v3/3.1/mapsjs-core.js' 'https://js.api.here.com/v3/3.1/mapsjs-service.js' 'https://js.api.here.com/v3/3.1/mapsjs.bundle.js'; style-src 'self'; frame-src 'self'"
//    );
//    next();
//});




// Set static folder 
//app.use(express.static(path.join(__dirname, "public"))); // This is allowing us to render index.html as the default templa


// Sanitize data
//app.use(mongoSanitize());


// Set security headers
//app.use(helmet());


// Prevent XSS attaches
//app.use(xss());


// Rate limiting
//const limiter = rateLimit({
//    windowMs: 10 * 60 * 1000, // 10 minutes
//    max: 100 // Max requests per time specified in windoMs
//})

//app.use(limiter);


// Prevent http param pollution
//app.use(hpp());


// Enable CORS
//app.use(cors());

// Error handler
app.use(errorHandler);


// Mount routers
app.use("/inputs", nyc_inputs); // --->  "/inputs" will be the base route for all the nyc_inputs routes
app.use("/realEstateVars", real_estate_vars); // ---> "/realEstateVars" will be the base route for all the  real_estate_vars routes 
app.use("/auth", auth);
app.use("/users", users);
app.use("/reviews", reviews);
app.use("/register", register)//<<<-----------------------------------------------------------------------------------------









/* 
app.get("/", function (req, res) {
    res.render("index.html") //<== here, we are rendering "index.html" every time we get a "get" request for the base route. 
    res.end();
});
*/



const PORT = process.env.PORT || 3000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode in ${PORT}`.yellow.bold)
);

process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => { process.exit(1) });
})

















