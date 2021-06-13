const mongoose = require('mongoose');

// Map global promises
mongoose.Promise = global.Promise;

// To fix all deprecation warnings, follow the below steps:
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

// Mongoose Connect
mongoose.connect(process.env.MONGO_URL)
	.then(() => console.log('MongoDB conneced'))
	.catch(err => console.log(err));
