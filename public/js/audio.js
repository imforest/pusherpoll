function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function playSound(e) {
	const min = 0;
	const max = document.querySelectorAll('audio').length;
	const dataKey = getRandomInt(min, max);
	const audio = document.querySelector(`audio[data-key="${dataKey}"]`);
	if (!audio) return;

	audio.currentTime = 0;
	audio.play();
}
