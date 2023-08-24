const mongoose = require('mongoose');
// const mongoURI = "mongodb://0.0.0.0:27017/inotebook";

const connectToMongo = ()=>{
    mongoose.connect(process.env.mongoURI,
        console.log("Connected to mongodb successfully")
    )
}

module.exports = connectToMongo;