var log = require("../logger.js");
module.exports = {
	alias: "afk",
	action: (client, message, params, config) => {
		if(config.afk) {
			config.afk = false;
			client.updateMessage(message, "No longer AFK", (err, msg) => client.deleteMessage(msg, {wait: 2000}));
			log.info("AFK mode off");
		}
		else {
			config.afk = true;
			client.updateMessage(message, "AFK", (err, msg) => client.deleteMessage(msg, {wait: 2000}));
			log.info("AFK mode on");
		}
	}
};
