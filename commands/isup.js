module.exports = {
	alias: "isup",
	action: (client, message, params) => {
		client.updateMessage(message, "http://www.isup.me/" + params[0]);
	}
};
