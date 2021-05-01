const pollUrl='poll';
const voteTitle = document.querySelector('#voteTitle').getAttribute('value');
const container = document.querySelector('#js-container');
const totalVoteMap = new Map();

function showResult() {
	window.location.href = `${pollUrl}/result/${voteTitle}`;
}

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
	return `${prizeId} 총 투표수 ${totalVoteMap.get(prizeId)}`;
}

function paintChart(containerId, prizeId, data) {
	const votes = data.votes.sort( (a, b) => a.team < b.team ? -1 : 1);
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
				text: getTitle(prizeId)
		},
		axisX: {
			interval: 1,
			labelAngle: 45
		},
		axisY: {
				title: '득표수',
				titleFontSize: 24,
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

function handleFormSubmit(form, prizeId) {
	form.addEventListener('submit', (e) => {
		const choice = document.querySelector(`input[name=${prizeId}]:checked`).value;
		const data = {team: choice, title: voteTitle, name: prizeId};

		fetch(pollUrl, {
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

function showChart(containerId, prizeId) {
	fetch(`${pollUrl}/${voteTitle}/${prizeId}`)
		.then(res => res.json())
		.then(data => {
			paintChart(containerId, prizeId, data);
		});
}

function insertZeroVote(prizes, teams) {
	const data = {
		title: voteTitle, 
		prizes: prizes, 
		teams: teams,
	};

	fetch(pollUrl + '/zerovote', {
		method: 'post',
		body: JSON.stringify(data),
		headers: new Headers({
			'Content-Type': 'application/json'
			})
		})
		.then(res => res.json())
		.then(data => console.log(data))
		.catch(err => console.log(err));
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

function initVoteForm() {
	const prizes = [
		{id: 'first', name: '가창상 (노래로 감동을 준 팀)'},
		{id: 'second', name: '연주상 (기타 연주 잘한 팀)'},
		{id: 'third', name: '발전상 (열정, 노력의 무대를 보여준 팀)'},
		{id: 'fourth', name: '인기상 (즐거운 무대를 보여준 팀)'},
	];

	const teams = [
		{name: '열두소리', song: 'song1'}, 
		{name: '땅콩가루', song: 'song2'}, 
		{name: 'F4', song: 'song3'}, 
		{name: '뉴슈가', song: 'song4'}, 
		{name: '레드아이', song: 'song5'}, 
		{name: '별밤 공감', song: 'song6'}, 
		{name: '파파야', song: 'song7'}, 
		{name: '딩가리딩가리', song: 'song8'}, 
		{name: '은가비', song: 'song9'}, 
		{name: '아인&파파로티', song: 'song10'}, 
		{name: '엘빔보', song: 'song11'}, 
		{name: '리차드', song: 'song12'}, 
		{name: '주주총회', song: 'song13'}, 
		{name: '외사', song: 'song14'}, 
	];

	// 투표하기 전에 팀목록을 도표에 표시
	// insertZeroVote(prizes, teams);

	prizes.forEach(prize => {
		const chartId = `js-${prize.id}-chart-container`;
		const form = makePoll(prize, teams);
		const chart = makeChart(chartId);

		form.appendChild(chart);
		container.appendChild(form);
		showChart(chartId, prize.id);
		handleFormSubmit(form, prize.id);

		restoreMyChoice(prize);
	});
}

const firstDateIsPastDayComparedToSecond = (firstDate, secondDate) => {
	if(firstDate.setHours(0,0,0,0) - secondDate.setHours(0,0,0,0) < 0) {
		const title = document.querySelector('#voteTitle');
		title.textContent = `${title.getAttribute("value")} 투표 마감`;
		const items = document.querySelectorAll('input[type=radio]');
		items.forEach(item => item.disabled = true);
	}
}

function setVoteDueDate() {
	const dueDate = new Date('2021-04-18');
	firstDateIsPastDayComparedToSecond(dueDate, new Date());
	setInterval(firstDateIsPastDayComparedToSecond, 1000 * 60, dueDate, new Date());
}

function init() {
	initVoteForm();
	setVoteDueDate();
}
