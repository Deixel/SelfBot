module.exports = {
	alias: "prune",
	action: (client, message, params) => {
		client.getChannelLogs(message.channel, (err, msgs) => {
			var myMsgs = msgs.filter(m => m.author.equals(client.user)).slize(0, params.length > 0 ? params[0] + 1 : 2);
			myMsgs.map(m => client.deleteMessage(m));
		});
	}
};
