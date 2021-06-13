const pollUrl='poll';
const container = document.querySelector('#js-container');
const totalVoteMap = new Map();
var voteTitle;

function setPusher(chart, prizeId) {
	// Enable pusher logging - don't include this in production
	Pusher.logToConsole = true;

	var pusher = new Pusher('ff4bf85a2ebd9ce87f14', {
		cluster: 'ap3',
		encrypted: true
	});

	var channel = pusher.subscribe('tongma-poll');
	channel.bind(prizeId, function(data) {
		chart.options.data[0].dataPoints.map(x => {
			if(x.label == data.team) {
				x.y += data.points;
				totalVoteMap.set(prizeId, totalVoteMap.get(prizeId) + data.points);
				chart.options.title.text = getTitle(prizeId);
				return x;
			} else {
				return x;
			}
		});

		chart.render();
	});
}

function compareDataPointYDescend(dataPoint1, dataPoint2) {
	return dataPoint2.y - dataPoint1.y;
}

function getSum(total, vote) {
	return total + vote.points;
}

function getTitle(prizeId) {
	return `총 투표수 ${totalVoteMap.get(prizeId)}`;
}

/**
 *  * Filter array items based on search criteria (query)
 *   */
function filterItems(arr, query) {
	return arr.filter(function(el) {
			return el.name.toLowerCase() === query.toLowerCase();
	})
}

function paintPieChart(containerId, prize, data) {
	const votesByPrizeId = filterItems(data.votes, prize.id);
	const votes = votesByPrizeId.sort( (a, b) => a.team < b.team ? -1 : 1);
	totalVoteMap.set(prize.id, votes.reduce(getSum, 0));
	// Const vote points - acc/current
	const voteCounts = votes.reduce(
		(acc, vote) => 
			((acc[vote.team] = (acc[vote.team] || 0) + vote.points), acc), {});

	const entries = Object.entries(voteCounts);
	let  maxCount = 0;
	entries.forEach(team => team[1] > maxCount ? maxCount = team[1] : '');

	let dataPoints = [];
	entries.forEach(team => {
		dataPoints.push({
			name: team[0], 
			y: team[1],
			exploded: team[1] == maxCount ? true : false,
		});
	});
	
	var chart = new CanvasJS.Chart(containerId, {
		exportEnabled: false,
		animationEnabled: true,
		title:{
			text: `${prize.name}`.split(' ')[0]
		},
		legend:{
			cursor: "pointer",
			itemclick: explodePie
		},
		data: [{
			type: "pie",
			showInLegend: false,
			toolTipContent: "{name}: <strong>{y}표</strong>",
			indexLabel: "{name} - {y}표",
			dataPoints: dataPoints
		}]
	});

	// decending order by points
	chart.options.data[0].dataPoints.sort(compareDataPointYDescend);
	chart.render();

	setPusher(chart, prize.id);
}

function explodePie (e) {
	if(typeof (e.dataSeries.dataPoints[e.dataPointIndex].exploded) === "undefined" || !e.dataSeries.dataPoints[e.dataPointIndex].exploded) {
		e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
	} else {
		e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
	}
	e.chart.render();
}                            

function paintChart(containerId, prizeId, data) {
	const votesByPrizeId = filterItems(data.votes, prizeId);
	const votes = votesByPrizeId.sort( (a, b) => a.team < b.team ? -1 : 1);
	totalVoteMap.set(prizeId, votes.reduce(getSum, 0));
	// Const vote points - acc/current
	const voteCounts = votes.reduce(
		(acc, vote) => 
			((acc[vote.team] = (acc[vote.team] || 0) + vote.points), acc), {});

	let dataPoints = [];
	const entries = Object.entries(voteCounts);
	entries.forEach(team => {
		dataPoints.push({
			label: team[0], 
			y: team[1]
		});
	});

	var chart = new CanvasJS.Chart(containerId, {
		animationEnabled: true,
		theme: 'light2',
		title: {
			text: getTitle(prizeId),
			fontSize: 14
		},
		axisX: {
			interval: 1,
			labelFontSize: 12,
			labelMaxWidth: 90,
			labelAngle: 45,
		},
		axisY: {
			title: '득표수',
			titleFontSize: 12,
			includeZero: true
		},
		data: [{
			type: 'column',
			yValueFormatString: '#,### 표',
			dataPoints: dataPoints
		}]
	});

	// decending order by points
	chart.options.data[0].dataPoints.sort(compareDataPointYDescend);
	chart.render();

	setPusher(chart, prizeId);
}

function showChart(containerId, prizeId) {
	fetch(`/${pollUrl}/${voteTitle}/${prizeId}`)
		.then(res => res.json())
		.then(data => {
			paintChart(containerId, prizeId, data);
		});
}

function handleFormSubmit(form, prizeId) {
	form.addEventListener('submit', (e) => {
		const choice = document.querySelector(`input[name=${prizeId}]:checked`).value;
		const data = {team: choice, title: voteTitle, name: prizeId, userAgent: navigator.userAgent};

		fetch(`/${pollUrl}`, {
			method: 'post',
			body: JSON.stringify(data),
			headers: new Headers({
				'Content-Type': 'application/json'
				})
			})
			.then(res => res.json())
			.then(data => LS.writeVote(data))
			.catch(err => console.log(err));

		e.preventDefault();
	});
}

function restoreMyChoice(prize) {
	const titleMap = LS.getExistingTitleMap();
	const nameMap = LS.getNameMap(titleMap);
	const myChoice = nameMap.get(prize.id);

	if(myChoice) {
		const team = myChoice.team;
		const myTeam = document.querySelector(`input[name=${prize.id}].item[value="${team}"]`);
		myTeam.checked = true;
		const items = document.querySelectorAll(`input[name=${prize.id}].item`);
		items.forEach(item => item.disabled = true);
		const button = document.querySelector(`input[name=${prize.id}].btn`);
		button.value = `${prize.name} 투표 완료`;
		button.classList.add("disabled");
	}
}

function initVoteForm(poll) {
	document.querySelector('#voteTitle').innerText = voteTitle;
	const container = document.querySelector('#js-container');

	/*
	const prizes = [
		{id: 'first', name: '가창상 (노래로 감동을 준 팀)'},
		{id: 'second', name: '연주상 (기타 연주 잘한 팀)'},
		{id: 'third', name: '발전상 (열정, 노력의 무대를 보여준 팀)'},
		{id: 'fourth', name: '인기상 (즐거운 무대를 보여준 팀)'},
	];
	*/

	poll.prizes.forEach((prize, index) => {
		const chartId = `js-${prize.id}-chart-container`;
		const form = makePoll(prize, index, poll.teams);
		const chart = makeChart(chartId);

		form.appendChild(chart);
		container.appendChild(form);
		showChart(chartId, prize.id);
		handleFormSubmit(form, prize.id);

		restoreMyChoice(prize);
	});
}

function showResult() {
	window.location.href = `/poll/result/${voteTitle}`;
}

const firstDateIsPastDayComparedToSecond = (firstDate, secondDate) => {
	if(firstDate.setHours(0,0,0,0) - secondDate.setHours(0,0,0,0) < 0) {
		const title = document.querySelector('#voteTitle');
		title.textContent = `${voteTitle} 마감`;
		const items = document.querySelectorAll('input[type=radio]');
		items.forEach(item => item.disabled = true);
	}
}

function setVoteDueDate(poll) {
	const dueDate = new Date(poll.dueDate);
	firstDateIsPastDayComparedToSecond(dueDate, new Date());
	setInterval(firstDateIsPastDayComparedToSecond, 1000 * 60, dueDate, new Date());
}

function initEventListener() {
	const items = document.querySelectorAll('input.item'); 
	items.forEach(item => item.addEventListener('change', playSound));
}
