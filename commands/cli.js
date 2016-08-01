var log = require("../logger.js");
module.exports = {
	alias: "cli",
	description: "Run a terminal command",
	hidden: true,
	action: (client, message, params) => {
		var exec = require("child_process").exec;
		params = params.join(" ");
		var benchmark = Date.now();
		exec(params, {timeout: 5000}, function(error, stdout, stderr) {
			if(error) {
				return log.error(error);
			}
			benchmark = Date.now() - benchmark;
			client.updateMessage(message.channel, "```bash\n" + params + "\n--------------------\n" + stdout + stderr + "\n--------------------\nin " + benchmark + "ms```");
		});
	}
};
