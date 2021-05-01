// local storage name
const TONGMA_LS = 'tongma';
var LS = {};

LS.getExistingTitleMap = function() {
	// Parse any JSON previously stored in allEntries
  var map = JSON.parse(localStorage.getItem(TONGMA_LS), reviver);

	if(!map) return new Map();
	else return map;
}

LS.getNameMap = function(titleMap) {
	const map = titleMap.get(voteTitle)
	if(!map) return new Map();
	else return map;
}

LS.writeVote = function(res) {
	const vote = res.vote;
	const titleMap = this.getExistingTitleMap();
	const nameMap = this.getNameMap(titleMap);

	nameMap.set(vote.name, vote);
	titleMap.set(vote.title, nameMap);
	localStorage.setItem(TONGMA_LS, JSON.stringify(titleMap, replacer));
}

LS.readVote = function() {
	console.log(localStorage.getItem(TONGMA_LS));
}

function replacer(key, value) {
	if (value instanceof Map) {
		return {
			dataType: 'Map',
			value: Array.from(value.entries()), // or with spread: value: [...value]
		};
	} else {
		return value;
	}
}

function reviver(key, value) {
	if(typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}
	return value;
}
