function makeChart(chartId) {
	const div = document.createElement("div");
	div.id = chartId;
	div.classList = 'chart';
	return div;
}

function createButton(prize) {
	const input = document.createElement("input");
	input.type = 'submit';
	input.name = prize.id;
	input.value = '투표';
	input.classList = 'btn';
	input.disabled = true;

	input.addEventListener('click', (e) => {
		const items = document.querySelectorAll(`input[name=${prize.id}].item`);
		items.forEach(item => item.disabled = true);

		const button = document.querySelector(`input[name=${prize.id}].btn`);
		button.value = `${prize.name} 투표 완료`;
		button.classList.add("disabled");
	});

	return input;
}

function makePoll(prize, index, teams) {
	const div = document.createElement("div");
	div.classList = 'container';
	const prizeName = document.createElement("h6");
	prizeName.classList = 'prize';
	prizeName.textContent = `${index + 1}. ${prize.name}`;
	const form = document.createElement("form");
	form.action = '';
	const listDiv = document.createElement("div");
	listDiv.classList = 'poll';
	const button = createButton(prize);

	div.appendChild(prizeName);
	div.appendChild(form);
	teams.sort( (a, b) => a.name < b.name ? -1 : 1)
		.forEach(team => {
			const item = makeItem(prize.id, team);
			listDiv.appendChild(item);
		});
	form.appendChild(listDiv);
	form.appendChild(button);

	return div;
}

function makeItem(prizeId, team) {
	const p = document.createElement("p");
	const label = document.createElement("label");
	const input = document.createElement("input");
	input.type = "radio";
	input.name = prizeId;
	input.classList = 'item';
	input.value = team.name;
	const span = document.createElement("span");
	span.innerHTML = `<b>${team.name}</b> <br> ${team.song}`;

	p.appendChild(label);
	label.appendChild(input);
	label.appendChild(span);

	input.addEventListener('click', (e) => {
		const button = document.querySelector(`input[name=${prizeId}].btn`);
		button.disabled = false;
	});

	return p;
}

function makePrizeName(prize, index) {
	const div = document.createElement("div");
	div.classList = 'container';
	const prizeName = document.createElement("h6");
	prizeName.classList = 'prize';
	prizeName.textContent = `${index + 1}. ${prize.name}`;

	div.appendChild(prizeName);

	return div;
}
