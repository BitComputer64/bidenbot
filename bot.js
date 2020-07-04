const Discord = require('discord.js');
const bot = new Discord.Client();

const cron = require('cron');
const cronJob = cron.CronJob;

const embeds = require('./embeds.json');
const token = process.env.BOT_TOKEN;

const prefix = "b!";

var job = null;
var mins = 0;
var video = { files: ['./video/Joe_Biden.mp4'] };
var channel = null;

bot.on('ready', () => {
	console.log('Bot is online.');
	bot.user.setActivity('b!help, b!info', { type: 'LISTENING' });
});

bot.on('message', function(message) {
	if (message.author.bot) { return; }
	
	var msg = message.content;

	if (msg.substring(0, 2) == prefix) {
		var args = msg.substring(2).split(" ");
		
		if (args[0].length == 0) { args = args.splice(1); }
		
		var cmd = args[0];
		args = args.splice(1);

		switch(cmd) {
			case "help":
			case "info":
				message.channel.send(embeds.help);
			break;

			case "channel":
			case "chan":
			case "set":
			case "sendin":
				if (!message.member.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('ADMINISTRATOR')) { return message.channel.send(`Sorry ${message.author.username}, you don't seem to have the "Manage Server" permission. Only users with that role can use this command.`); }
				channel = message.channel;
				var req = embeds.setting;
				req.embed.title = "**Channel successfully set**";
				req.embed.footer.text = "Requested by " + message.author.username;
				req.embed.fields[0].name = "Channel set to";
				req.embed.fields[0].value = channel.name;
				channel.send(req);
			break;

			case "frequency":
			case "freq":
				if (!message.member.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('ADMINISTRATOR')) { return message.channel.send(`Sorry ${message.author.username}, you don't seem to have the "Manage Server" permission. Only users with that role can use this command.`); }
				if (args.length != 1) { return message.channel.send("There were unrecognised/too few arguments provided."); }
				var num = parseInt(args[0]);
				if (isNaN(num)) { return message.channel.send("Invalid argument provided. Please provide a valid number from 1-60."); }
				if (args[0] <= 0 || args[0] > 60) { return message.channel.send("Please enter a valid number from 1-60."); }
				mins = args[0];
				var req = embeds.setting;
				req.embed.title = "**Frequency successfully set**";
				req.embed.footer.text = "Requested by " + message.author.username;
				req.embed.fields[0].name = "Frequency set to";
				req.embed.fields[0].value = (mins == 1) ? "every minute." : `every ${mins} minutes.`;
				message.channel.send(req);
			break;

			case "video":
			case "vid":
			case "url":
				if (!message.member.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('ADMINISTRATOR')) { return message.channel.send(`Sorry ${message.author.username}, you don't seem to have the "Manage Server" permission. Only users with that role can use this command.`); }
				if (args.length != 1) { return message.channel.send("Too many/too few parameters provided."); }
				var req = embeds.setting;
				if (args[0] == "default") {
					video = { files: ['./video/Joe_Biden.mp4'] };
					req.embed.title = "**Video successfully reset**";
					req.embed.footer.text = "Requested by " + message.author.username;
					req.embed.fields[0].name = "Video set to";
					req.embed.fields[0].value = "Joe_Biden.mp4";
					message.channel.send(req);
				}
				else {
					video = args[0];
					req.embed.title = "**Video successfully set**";
					req.embed.footer.text = "Requested by " + message.author.username;
					req.embed.fields[0].name = "Video set to";
					req.embed.fields[0].value = video;
					message.channel.send(req);
				}
			break;

			case "start":
				if (!message.member.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('ADMINISTRATOR')) { return message.channel.send(`Sorry ${message.author.username}, you don't seem to have the "Manage Server" permission. Only users with that role can use this command.`); }
				if (!channel || mins == 0) { return message.channel.send("One or more of the settings are not properly configured. Please change them before starting."); }
				if (job != null) { return message.channel.send("Schedule has already begun!"); }
				job = new cronJob(`0 */${mins} * * * *`, function() {
					channel.send(video);
				});
				job.start();
				message.channel.send("Schedule started.");
			break;

			case "stop":
				if (!message.member.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('ADMINISTRATOR')) { return message.channel.send(`Sorry ${message.author.username}, you don't seem to have the "Manage Server" permission. Only users with that role can use this command.`); }
				if (!job) { return message.channel.send("The task has not yet begun. If you wish to start the task, run b!start."); }
				job.stop();
				job = null;
				message.channel.send("Schedule stopped.");
			break;
		}
	}
});

bot.login(token);
