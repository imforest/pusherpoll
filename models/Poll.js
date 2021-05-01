const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	dueDate: {
		type: String,
		required: true
	},
	prizes: {
			type: [
				"Mixed"
			],
			required: true
	},
	teams: {
			type: [
				"Mixed"
			],
			required: true
	},
	createdAt: {
		type: String,
		required: true
	},
	ip: {
		type: String,
		required: true
	},
});

// Create collection and add schema
const Poll = mongoose.model('Poll', PollSchema);

module.exports = Poll;
