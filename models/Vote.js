const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
	team: {
		type: String,
		required: true
	},
	points: {
		type: Number,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	title: {
		type: String,
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
const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;
