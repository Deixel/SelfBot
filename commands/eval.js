module.exports = {
	alias: "eval",
	action: (client, message, params) => {
		var vm = require("vm");
		params = params.join(" ");
		var benchmark = Date.now();
		var result;
		//TODO is VM needed? Will eval() do?
		var context = {
			message: message,
			client: client,
			console: console
		};
		try {
			result = vm.runInNewContext(params, context);
		}
		catch(error) {
			result = error;
		}
		benchmark = Date.now() - benchmark;
		client.updateMessage(message, "```js\n" + params + "\n--------------------\n" + result + "\n--------------------\n" + "in " + benchmark + "ms```");
	}
};
