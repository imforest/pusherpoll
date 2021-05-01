const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

const Pusher = require('pusher');

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID,
	key: process.env.PUSHER_APP_KEY,
	secret: process.env.PUSHER_APP_SECRET,
	cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true
});

router.post('/zerovote/notused', (req, res) => {
	const newVote = {
		title: req.body.title,
		points: 0,
		createdAt: new Date().toString(),
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
	}

	req.body.prizes.forEach(prize => {
		req.body.teams.forEach(team => {
	  	newVote.name = prize.id;
	    newVote.team = team.name;
	    new Vote(newVote).save().then(vote => console.log(vote));
		});
	});

	return res.json({success: true, message: 'Zero for voting'});
});

router.get('/zerovote/:voteTitle', (req, res) => {
	const newVote = {
		title: req.params.voteTitle,
		points: 0,
		createdAt: new Date().toString(),
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
	}

	console.log(newVote);
	const poll = Poll.findOne({'title': `${req.params.voteTitle}`}, function (err, poll) {
		poll.prizes.forEach(prize => {
			poll.teams.forEach(team => {
				newVote.name = prize.id;
				newVote.team = team.name;
				new Vote(newVote).save().then(vote => console.log(vote));
			});
		});
	});
});

router.get('/info/:voteTitle', (req, res) => {
	const poll = Poll.findOne({'title': `${req.params.voteTitle}`}, function (err, poll) {
		if (err) res.send(err)
		const pollJson = JSON.stringify(poll);
		res.render('poll', {poll: pollJson});
	});
});

router.get('/result/:voteTitle', (req, res) => {
	const votes = Vote.find({'title': `${req.params.voteTitle}`, points: 1}, function (err, votes) {
		  if (err) res.send(err)
			votesJson = JSON.stringify(votes);
			res.render('result', {votes: votesJson});
		});
});

router.get('/:voteTitle/:prizeId', (req, res) => {
	Vote.find({'title': `${req.params.voteTitle}`, 'name': `${req.params.prizeId}`})
		.then(votes => res.json({success: true, votes: votes}));
});

router.post('/', (req, res) => {
	const newVote = {
		title: req.body.title,
		name: req.body.name,
		team: req.body.team,
		points: 1,
		createdAt: new Date().toString(),
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
	}

	new Vote(newVote).save().then(vote => {
		pusher.trigger('tongma-poll', vote.name, {
			title: vote.title,
			team: vote.team,
			points: vote.points
		});
	});

	return res.json({success: true, message: 'Thank you for voting', vote: newVote});
});

module.exports = router;
