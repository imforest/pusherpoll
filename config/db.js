const mongoose = require('mongoose');

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(process.env.MONGO_URL)
	.then(() => console.log('MongoDB conneced'))
	.catch(err => console.log(err));
