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
				message.edit(textList).then(msg => msg.delete(5000));
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
					message.edit(`Added \`${newText.alias}\``).then(msg => msg.delete(5000));
				});
			}
			else {
				connection.query("SELECT contents FROM quicktext WHERE alias = ?", params[0], function(err, rows) {
					if(err) {
						return log.error(err);
					}
					message.edit(rows.length == 0 ? "404: Message not found" : rows[0].contents);
				});
			}
		}
	}
};
