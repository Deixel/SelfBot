module.exports = {
	alias: "isup",
	action: (client, message, params) => {
		message.edit(`http://www.isup.me/${params[0]}`);
	}
};
