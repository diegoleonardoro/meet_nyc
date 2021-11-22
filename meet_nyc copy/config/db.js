
const mongoose = require("mongoose");

const connectDB = async () => {

    const conn = await mongoose.connect(process.env.MONGO_URI, {
        //options that will stop some warnings from happening:
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

}

module.exports = connectDB;


