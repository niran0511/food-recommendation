const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer necessary in Mongoose 6+
        });

<<<<<<< HEAD
        console.log(`MongoDB Connected: ${conn.connection.host}`);
=======
        console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Implement retry logic or process exit depending on deployment
        setTimeout(connectDB, 5000); // Retry after 5s
    }
};

module.exports = connectDB;
