var Discord = require("discord.js");
var config =  require("./config");
var appConfig = config.appConfig;
var cmds = require("./commands/commands");
var mysql = require("mysql");
var connection;

function db_connect() {
	connection = mysql.createConnection(appConfig.mysql);
	connection.connect(function(err) {
		if(err) {
			console.error(err);
			setTimeout(db_connect, 2000);
		}
	});
	connection.on("error", function(err) {
		if(err.code === "PROTOCOL_CONNECTION_LOST") {
			db_connect();
		}
		else {
			return console.log(err);
		}
	});
}

var client = new Discord.Client({autoReconnect: true});

client.on("message", (message) => {
	if(message.author.equals(client.user)) {
		var cmd = cmds.get(message.content.split(" ")[0]);
		if(cmd != null) {
			cmd.action(message);
		}
	}
});

client.on("ready", () => {
	console.log("Logged in successfully");
	db_connect();
	console.log("Established connection to database");
	cmds.setUp(client, connection);
});

process.on("SIGINT", () => process.exit(0));

client.loginWithToken(appConfig.apikey, (err) => console.log(err));
