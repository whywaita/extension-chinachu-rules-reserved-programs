// programMatchesRule from https://github.com/Chinachu/Chinachu/blob/198614c6be8021dbd6af2ce0c4c6b9935fb2e9b7/common/lib/chinachu-common.js#L261
export function programMatchesRule(rule, program, nf, fullTitle_norm, detail_norm) {
	var i, j, l, m, isFound;

	// 引数に互換性を持たせるため、追加した分はチェック
	// タイトル、詳細
	if (nf) {
		if (!fullTitle_norm) {
			fullTitle_norm = program.fullTitle.normalize(nf);
		}
		if (!detail_norm) {
			detail_norm = program.detail.normalize(nf);
		}
	}

	// isDisabled
	if (rule.isDisabled) { return false; }

	// sid
	if (rule.sid && rule.sid !== program.channel.sid) { return false; }

	// types
	if (rule.types) {
		if (rule.types.indexOf(program.channel.type) === -1) { return false; }
	}

	// channels
	if (rule.channels) {
		if (rule.channels.indexOf(program.channel.id) === -1) {
			if (rule.channels.indexOf(program.channel.channel) === -1) {
				if (rule.channels.indexOf(program.channel.type+'_'+program.channel.sid) === -1) {
					return false;
				}
			}
		}
	}

	// ignore_channels
	if (rule.ignore_channels) {
		if (rule.ignore_channels.indexOf(program.channel.id) !== -1) {
			return false;
		}
		if (rule.ignore_channels.indexOf(program.channel.channel) !== -1) {
			return false;
		}
		if (rule.ignore_channels.indexOf(program.channel.type+'_'+program.channel.sid) !== -1) {
			return false;
		}
	}

	// category
	if (rule.category && rule.category !== program.category) { return false; }

	// categories
	if (rule.categories) {
		if (rule.categories.indexOf(program.category) === -1) { return false; }
	}

	// hour
	if (rule.hour && (typeof rule.hour.start === 'number') && (typeof rule.hour.end === 'number') && !(rule.hour.start === 0 && rule.hour.end === 24)) {
		var ruleStart = rule.hour.start;
		var ruleEnd   = rule.hour.end;

		var progStart = new Date(program.start).getHours();
		var progEnd   = new Date(program.end).getHours();
		var progEndMinute = new Date(program.end).getMinutes();

		if (progStart > progEnd) {
			progEnd += 24;
		}
		if (progEndMinute === 0) {
			progEnd -= 1;
		}

		if (ruleStart > ruleEnd) {
			if ((ruleStart > progStart) && (ruleEnd < progEnd)) { return false; }
		} else {
			if ((ruleStart > progStart) || (ruleEnd < progEnd)) { return false; }
		}
	}

	// duration
	if (rule.duration && (typeof rule.duration.min !== 'undefined') && (typeof rule.duration.max !== 'undefined')) {
		if ((rule.duration.min > program.seconds) || (rule.duration.max < program.seconds)) { return false; }
	}

	// reserve_titles
	if (rule.reserve_titles) {
		isFound = false;

		for (i = 0; i < rule.reserve_titles.length; i++) {
			if (fullTitle_norm === null) {
				console.log("program: " + JSON.stringify(program));
			}
			if (nf) {
				if (fullTitle_norm.match(rule.reserve_titles[i].normalize(nf)) !== null) { isFound = true; }
			}
			else {
				if (program.fullTitle.match(rule.reserve_titles[i]) !== null) { isFound = true; }
			}
		}

		if (!isFound) { return false; }
	}

	// ignore_titles
	if (rule.ignore_titles) {
		for (i = 0; i < rule.ignore_titles.length; i++) {
			if (nf) {
				if (fullTitle_norm.match(rule.ignore_titles[i].normalize(nf)) !== null) { return false; }
			}
			else {
				if (program.fullTitle.match(rule.ignore_titles[i]) !== null) { return false; }
			}
		}
	}

	// reserve_descriptions
	if (rule.reserve_descriptions) {
		if (!program.detail) { return false; }

		isFound = false;

		for (i = 0; i < rule.reserve_descriptions.length; i++) {
			if (nf) {
				if (detail_norm.match(rule.reserve_descriptions[i].normalize(nf)) !== null) { isFound = true; }
			}
			else {
				if (program.detail.match(rule.reserve_descriptions[i]) !== null) { isFound = true; }
			}
		}

		if (!isFound) { return false; }
	}

	// ignore_descriptions
	if (rule.ignore_descriptions && program.detail) {
		for (i = 0; i < rule.ignore_descriptions.length; i++) {
			if (nf) {
				if (detail_norm.match(rule.ignore_descriptions[i].normalize(nf)) !== null) { return false; }
			}
			else {
				if (program.detail.match(rule.ignore_descriptions[i]) !== null) { return false; }
			}
		}
	}

	// ignore_flags
	if (rule.ignore_flags) {
		for (i = 0; i < rule.ignore_flags.length; i++) {
			for (j = 0; j < program.flags.length; j++) {
				if (rule.ignore_flags[i] === program.flags[j]) { return false; }
			}
		}
	}

	// reserve_flags
	if (rule.reserve_flags) {
		if (!program.flags) { return false; }

		isFound = false;

		for (i = 0; i < rule.reserve_flags.length; i++) {
			for (j = 0; j < program.flags.length; j++) {
				if (rule.reserve_flags[i] === program.flags[j]) { isFound = true; }
			}
		}

		if (!isFound) { return false; }
	}

	return true;
};
