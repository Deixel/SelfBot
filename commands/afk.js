var log = require("../logger.js");
module.exports = {
	alias: "afk",
	action: (client, message, params, config) => {
		if(config.afk) {
			config.afk = false;
			message.edit("No longer AFK").then(msg => msg.delete(2000)).catch(log.error);
			log.info("AFK mode off");
		}
		else {
			config.afk = true;
			message.edit("AFK").then(msg => msg.delete(2000)).catch(log.error);
			log.info("AFK mode on");
		}
	}
};
