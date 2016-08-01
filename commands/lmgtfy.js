module.exports = {
	alias: "lmgtfy",
	action: (client, message, params) => {
		client.updateMessage(message, "<http://lmgtfy.com/?q=" + params.join("+") + ">");
	}
};
