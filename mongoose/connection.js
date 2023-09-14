const mongoose = require('mongoose')
require('dotenv').config()
module.exports={
    connect(){
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
            })
            .then(() => {
                console.log("Database connected");
            })
            .catch((err) => {
                console.error("Error connecting to database:", err);
            });
    }
}