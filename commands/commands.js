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
		client.updateMessage(message, "ponging in `" + (Date.now() - message.timestamp) +"`ms");
	}
);

new Command("hs",
	"Search the RuneScape High Scores for a player",
	function(message) {
		var p = getParams(message.content);
		if(p.length > 0) {
			var player = p.join("_");
			//http://services.runescape.com/m=hiscore/index_lite.ws?player=DisplayName
			client.updateMessage(message, "Loading...", function(err, msg) {
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
			client.updateMessage(message, "You need to specify a player");
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
				client.updateMessage(message, textList);
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
				});
			}
			else {
				connection.query("SELECT contents FROM quicktext WHERE alias = ?", params[0], function(err, rows) {
					if(err) {
						console.error(err);
					}
					if(rows.length == 0) {
						client.updateMessage(message, "404: Message not found.");
					}
					else {
						client.updateMessage(message, rows[0].contents);
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
		client.updateMessage(message, "```js\n" + params + "\n--------------------\n" + result + "\n--------------------\n" + "in " + benchmark + "ms```");
	},
	true
);

new Command("cli",
	"Run a terminal command",
	function(message) {
		var exec = require("child_process").exec;
		var params = getParams(message.content).join(" ");
		var benchmark = Date.now();
		exec(params, {timeout: 5000}, function(error, stdout, stderr) {
			if(error) {
				console.error(error);
			}
			benchmark = Date.now() - benchmark;
			client.updateMessage(message, "```bash\n" + params + "\n--------------------\n" + stdout + stderr + "\n--------------------\nin " + benchmark + "ms```");
		});

	},
	true
);

new Command("lmgtfy",
	"Generate a LMGTFY link",
	function(message) {
		var params = getParams(message.content).join("+");
		client.updateMessage(message, "<http://lmgtfy.com/?q=" + params + ">");
	}
);

new Command("isup",
	"Check whether a site is down or not",
	(message) => {
		var params = getParams(message.content);
		client.updateMessage(message, "http://www.isup.me/" + params);
	}
);

new Command("prune",
	"Remove the last X messages I sent",
	(message) => {
		var params = getParams(message.content);
		client.getChannelLog(message.channel, (err, msgs) => {
			var myMsgs = msgs.filter(m => m.author.equals(client.user)).slice(0, params[0]);
			myMsgs.map(m => client.deleteMessage(m));
		});
	}
);
