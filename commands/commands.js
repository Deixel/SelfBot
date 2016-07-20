/*
cmd - what the user types, sans prefix
description - meaningful description, for use with help
action - what the command does
*/

var commands = {};
var client;
var connection;


exports.get = function(cmd) {
	return commands[cmd];
};

exports.setUp = function(cl, con) {
	client = cl;
	connection = con;
};

function Command(cmd, descr, action, hidden = false) {
	this.cmd = cmd;
	this.description = descr;
	this.action = action;
	this.hidden = hidden;
	commands[cmd]=this;
}

function getParams(content) {
	var params = content.split(" ");
	if(content.indexOf(client.user.mention()) > -1) {
		params.shift();
	}
	params.shift();
	return params;
}

new Command("ping",
	"It's like ping-pong, but with words.",
	function(message) {
		client.reply(message, "pong");
	}
);

new Command("hs",
	"Search the RuneScape High Scores for a player",
	function(message) {
		var p = getParams(message.content);
		if(p.length > 0) {
			var player = p.join("_");
			//http://services.runescape.com/m=hiscore/index_lite.ws?player=DisplayName
			client.sendMessage(message.channel, "Loading...", function(err, msg) {
				var http = require("http");
				http.get("http://services.runescape.com/m=hiscore/index_lite.ws?player=" + player, function(res) {
					res.setEncoding("utf8");
					var hsRaw = "";
					res.on("data", function(d) {
						hsRaw = hsRaw.concat(d);
					});
					res.on("end", function() {
						var numSkills = 27;
						var skillRaw = hsRaw.split("\n");
						var skillNames = require("../resources/rs-skill-names");
						var output = "";
						for(var i = 0; i <= numSkills; i++) {
							var sTemp = skillRaw[i].split(",");
							output = output.concat(skillNames[i] + ": " + sTemp[2] + " (" + sTemp[1] + ")\n");
						}
						client.updateMessage(msg, "**" + player + "'s Skills**\n```Javascript\n" + output + "```");
					});
				});
			});
		}
		else {
			client.reply(message, "You need to specify a player");
		}

	}
);

new Command("text",
	"Quickly print some saved text",
	function(message, cb) {
		var params = getParams(message.content);
		if(params.length == 0 || (params.length > 0 && params[0] === "list")) {
			connection.query("SELECT alias FROM quicktext", function(err, rows) {
				if(err) {
					console.error(err);
				}
				var textList = "";
				for(var i = 0; i < rows.length; i++) {
					textList = textList.concat(rows[i].alias + " ");
				}
				client.sendMessage(message.channel, textList);
			});
		}
		else if(params.length > 0) {
			if(params[0] === "add") {
				var newText = {};
				client.awaitResponse(message, "What tag would you like to add " + message.author + "?", function(err, msg1) {
					if(err) {
						console.error(err);
					}
					newText.alias = msg1.content;
					connection.query("SELECT alias FROM quicktext WHERE alias = ?", [newText.alias], function(err, rows) {
						if(err) {
							console.error(err);
						}
						if(rows.length != 0) {
							client.sendMessage(message.channel, "Sorry, that tag already exists.");
						}
						else {
							client.awaitResponse(msg1, "And what should `" + newText.alias +"` display?", function(err, msg2) {
								if(err) {
									console.error(err);
								}
								newText.contents = msg2.content;
								connection.query("INSERT INTO quicktext SET ?", newText, function(err) {
									if(err) {
										console.error(err);
									}
									client.reply(msg2, "Added `" + newText.alias + "`");
								});
							});
						}
					});

				});
			}
			else {
				connection.query("SELECT contents FROM quicktext WHERE alias = ?", params[0], function(err, rows) {
					if(err) {
						console.error(err);
					}
					if(rows.length == 0) {
						client.sendMessage(message.channel, "404: Message not found.");
					}
					else {
						client.sendMessage(message.channel, rows[0].contents);
					}
					//Pretty much only used for testing
					if(cb != null)	{
						cb();
					}
				});
			}
		}
	}
);

new Command("eval",
	"Run some code",
	function(message) {
		if(message.author.id === "113310775887536128") {
			var vm = require("vm");
			var params = getParams(message.content).join(" ");
			var benchmark = Date.now();
			var result;
			var context = {
				message: message,
				client: client,
				console: console,
				commands: commands
			};
			try {
				result = vm.runInNewContext(params, context);
			}
			catch(error) {
				result = error;
			}
			benchmark = Date.now() - benchmark;
			client.sendMessage(message.channel, "```js\n" + params + "\n--------------------\n" + result + "\n--------------------\n" + "in " + benchmark + "ms```");
		}
		else {
			client.sendMessage(":no_entry: **Permission Denied** :no_entry:");
		}
	},
	true
);

new Command("cli",
	"Run a terminal command",
	function(message) {
		if(message.author.id === "113310775887536128") {
			var exec = require("child_process").exec;
			var params = getParams(message.content).join(" ");
			var benchmark = Date.now();
			exec(params, {timeout: 5000}, function(error, stdout, stderr) {
				if(error) {
					console.error(error);
				}
				benchmark = Date.now() - benchmark;
				client.sendMessage(message.channel, "```bash\n" + params + "\n--------------------\n" + stdout + stderr + "\n--------------------\nin " + benchmark + "ms```");
			});
		}
		else {
			client.sendMessage(":no_entry: **Permission Denied** :no_entry:");
		}
	},
	true
);
