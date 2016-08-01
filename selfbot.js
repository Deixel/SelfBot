var Discord = require("discord.js");
var mysql = require("mysql");
var log = require("./logger.js");
var config =  require("./config");
var appConfig = config.appConfig;

var connection;
var commands = {};

commands.load = {
	alias: "load",
	description: "Load a command",
	hidden: true,
	action: (client, message, params) => {
		if(message.author.id == appConfig.ownerid) {
			try {
				commands[params[0]] = require("./commands/" + params[0] + ".js");
				client.updateMessage(message, "Successfully loaded " + params[0]);
				log.info("Loaded " + params[0]);
			}
			catch(err) {
				client.updateMessage(message, "Failed to load " + params[0]);
				log.error(err);
			}
		}
		else {
			client.updateMessage(message, ":no_entry: **Permission Denied** :no_entry:");
		}
	}
};

commands.unload = {
	alias: "unload",
	description: "Unload a command",
	hidden: true,
	action:  (client, message, params) => {
		if(message.author.id == appConfig.ownerid) {
			try {
				delete commands[params[0]];
				delete require.cache[require.resolve("./commands/" + params[0] + ".js")];
				client.updateMessage(message, "Successfully unloaded " + params[0]);
				log.info("Unloaded " + params[0]);
			}
			catch(err) {
				client.updateMessage(message, "Failed to unload " + params[0]);
				log.error(err);
			}
		}
		else {
			client.updateMessage(message, ":no_entry: **Permission Denied** :no_entry:");
		}
	}
};

commands.reload = {
	alias: "reload",
	description: "Reload a command",
	hidden: true,
	action: (client, message, params) => {
		if(message.author.id == appConfig.ownerid) {
			// commands.unload.action(client, message, params);
			// commands.load.action(client, message, params);
			try {
				delete commands[params[0]];
				delete require.cache[require.resolve("./commands/" + params[0] + ".js")];
				commands[params[0]] = require("./commands/" + params[0] + ".js");
				client.updateMessage(message, "Successfully reloaded " + params[0]);
				log.info("Reloaded " + params[0]);
			}
			catch(err) {
				client.updateMessage(message, "Failed to reload " + params[0]);
				log.error(err);
			}

		}
	}
};

function loadCommands() {
	var fs = require("fs");
	var files = fs.readdirSync("./commands");
	var loaded = 0;
	for(let file of files) {
		if(file.endsWith(".js")) {
			commands[file.slice(0, -3)] = require("./commands/" + file);
			loaded++;
		}
	}
	log.info("Loaded  " + loaded + " commands!");
}

function getParams(content) {
	var params = content.split(" ");
	if(content.indexOf(client.user.mention()) > -1) {
		params.shift();
	}
	params.shift();
	return params;
}

function db_connect() {
	connection = mysql.createConnection(appConfig.mysql);
	connection.connect(function(err) {
		if(err) {
			log.error(err);
			setTimeout(db_connect, 2000);
		}
	});
	connection.on("error", function(err) {
		if(err.code === "PROTOCOL_CONNECTION_LOST") {
			db_connect();
		}
		else {
			return log.error(err);
		}
	});
}

var client = new Discord.Client({autoReconnect: true});

client.on("message", (message) => {
	if(message.author.equals(client.user)) {
		var cmd = commands[message.content.split(" ")[0]];
		if(cmd != null) {
			cmd.action(client, message, getParams(message.content), config);
		}
	}
});

client.on("ready", () => {
	log.info("Logged in successfully");
	db_connect();
	log.info("Established connection to database");
	loadCommands();
});

process.on("SIGINT", () => process.exit(0));

client.loginWithToken(appConfig.apikey, (err) => { if(err) log.error(err); });
