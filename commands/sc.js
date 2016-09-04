module.exports = {
	alias: "sc",
	action: (client, message, params) => {
		var shortcuts = {
			"lenny": "( ͡° ͜ʖ ͡°)",
			"shrug": "¯\\_(ツ)_/¯",
			"justright": "✋😩👌",
			"tableflip": "(╯°□°）╯︵ ┻━┻",
			"unflip": "┬──┬﻿ ノ( ゜-゜ノ)"
		};
		if(shortcuts[params[0]]) {
			message.edit(shortcuts[params[0]]);
		}
	}
};
