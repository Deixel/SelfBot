var log = require("../logger.js");
module.exports = {
	alias: "text",
	action: (client, message, params, config) => {
		var connection = config.connection;
		if(params.length == 0 || (params.length > 0 && params[0] === "list")) {
			connection.query("SELECT alias FROM quicktext", function(err, rows) {
				if(err) {
					return log.error(err);
				}
				var textList = "";
				for(var i = 0; i < rows.length; i++) {
					textList = textList.concat(rows[i].alias + " ");
				}
				client.updateMessage(message, textList, (err, message) => client.deleteMessage(message, {wait: 5000}));
			});
		}
		else if(params.length > 0) {
			if(params[0] === "add") {
				params.shift();
				var newText = {};
				newText.alias = params.shift();
				newText.contents = params.join(" ");
				connection.query("INSERT INTO quicktext SET ?", newText, (err) => {
					if(err) return console.error(err);
					client.updateMessage(message, "Added `" + newText.alias + "`", (err, message) => client.deleteMessage(message, {wait: 2000}) );
				});
			}
			else {
				connection.query("SELECT contents FROM quicktext WHERE alias = ?", params[0], function(err, rows) {
					if(err) {
						return log.error(err);
					}
					if(rows.length == 0) {
						client.updateMessage(message, "404: Message not found.");
					}
					else {
						client.updateMessage(message, rows[0].contents);
					}
				});
			}
		}
	}
};
