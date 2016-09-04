var Discord = require("discord.js");
var mysql = require("mysql");
var log = require("./logger.js");
var config =  require("./config");
var appConfig = config.appConfig;
config.afk = false;
var afkTimeout;
const afkTime = 30 * 60 * 1000;

var connection;
var commands = {};

commands.load = {
	alias: "load",
	description: "Load a command",
	hidden: true,
	action: (client, message, params) => {
		try {
			commands[params[0]] = require("./commands/" + params[0] + ".js");
			message.edit(`Sucessfully loaded ${params[0]}`);
			log.info("Loaded " + params[0]);
		}
		catch(err) {
			message.edit(`Failed to load ${params[0]}`);
			log.error(err);
		}
	}
};

commands.unload = {
	alias: "unload",
	description: "Unload a command",
	hidden: true,
	action:  (client, message, params) => {
		try {
			delete commands[params[0]];
			delete require.cache[require.resolve("./commands/" + params[0] + ".js")];
			message.edit(`Successfully unloaded ${params[0]}`);
			log.info("Unloaded " + params[0]);
		}
		catch(err) {
			message.edit(`Failed to unload ${params[0]}`);
			log.error(err);
		}
	}
};

commands.reload = {
	alias: "reload",
	description: "Reload a command",
	hidden: true,
	action: (client, message, params) => {
		try {
			delete commands[params[0]];
			delete require.cache[require.resolve("./commands/" + params[0] + ".js")];
			commands[params[0]] = require("./commands/" + params[0] + ".js");
			message.edit(`Successfully reloaded ${params[0]}`);
			log.info("Reloaded " + params[0]);
		}
		catch(err) {
			message.edit(`Failed to reload ${params[0]}`);
			log.error(err);
		}

	}
};

commands.listcmds = {
	alias: "listcmds",
	description: "List all loaded commands",
	hidden: true,
	action: (client, message) => {
		var cmdlist = Object.keys(commands);
		message.edit(cmdlist);
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
	config.connection = connection;
	connection.connect(function(err) {
		if(err) {
			log.error(err);
			setTimeout(db_connect, 2000);
		}
		else log.info("Connected to database");
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

var client = new Discord.Client();

client.on("message", (message) => {
	if(message.author.id === client.user.id) {
		if(config.afk) config.afk = false;
		else {
			clearTimeout(afkTimeout);
		}

		afkTimeout = setTimeout(setAfk, afkTime);
		var cmd = commands[message.content.split(" ")[0]];
		if(cmd != null) {
			log.info("Running " + message.content);
			cmd.action(client, message, getParams(message.content), config);
		}
	}
	if(config.afk && message.isMentioned(client.user) && !message.everyoneMentioned) {
		//Send notification to IFTTT
		log.info("Sent AFK Mention from " + message.author.username);
		let request = require("request");
		let options = {
			url: "https://maker.ifttt.com/trigger/discord_mention/with/key/" + appConfig.iftttkey,
			method: "POST",
			qs: { "value1": message.author.username, "value2": message.channel.name }
		};
		request(options, (err) => {if(err) log.error(err);});
	}
	else if(config.afk && !message.server && !message.author.equals(client.user)) {
		log.info("Sent AFK DM from " + message.author.username);
		let request = require("request");
		let options = {
			url: "https://maker.ifttt.com/trigger/discord_dm/with/key/" + appConfig.iftttkey,
			method: "POST",
			qs: { "value1": message.author.username, "value2": message.cleanContent }
		};
		request(options, (err) => {if(err) log.error(err);});
	}
});

client.on("ready", () => {
	afkTimeout = setTimeout(setAfk, afkTime);
	log.info("Client emitted READY");
});

function setAfk() {
	config.afk = true;
	log.info("Going AFK");
}

process.on("SIGINT", () => process.exit(0));

db_connect();
loadCommands();
client.login(appConfig.apikey).then(() => log.info("Logged in with token")).catch(log.error);
