module.exports = {
	alias: "lmgtfy",
	action: (client, message, params) => {
		message.edit(`<http://lmgtfy.com/?q=${params.join("+")}>`);
	}
};
