module.exports = {
	alias: "ping",
	action: (client, message) => {
		client.updateMessage(message, "ponging in `" + (Date.now() - message.timestamp) + "`ms");
	}
};
