var log = require("../logger.js");
module.exports = {
	alias: "prune",
	action: (client, message, params) => {
		message.channel.fetchMessages({limit: 50}).then(msgs => {
			let toDel = params.length > 0 ? parseInt(params[0]) + 1 : 2;
			let myMsgs = msgs.filter(m => m.author.id === client.user.id).slice(0, toDel);
			myMsgs.deleteAll();
			log.info(`Pruned ${myMsgs.length} messages from ${message.channel.name}`);
		}).catch(log.error);
	}
};
