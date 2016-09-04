module.exports = {
	alias: "ping",
	action: (client, message) => {
		message.edit(`ponging in \`${Date.now() - message.timestamp}\`ms`);
	}
};
