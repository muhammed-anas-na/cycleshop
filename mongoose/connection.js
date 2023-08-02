const mongoose = require('mongoose')
module.exports={
    connect(){
        mongoose.connect('mongodb://0.0.0.0:27017/latestdb', {
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