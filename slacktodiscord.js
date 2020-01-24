const DISCORD_TOKEN         = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL       = '';
const DISCORD_CHANNELID     = '670052145583751172';
const slackSigningSecret    = process.env.SLACK_SIGNING_SECRET;
const token                 = process.env.SLACK_TOKEN; 

const Discord = require('discord.js');
const discord_client = new Discord.Client();
var discord_channel;

discord_client.login(DISCORD_TOKEN);

discord_client.on('ready', function(){
	//Finds the right channel to send the messages
	var param = DISCORD_CHANNEL !== "" ? "name" : "id";
	var value = DISCORD_CHANNEL !== "" ? DISCORD_CHANNEL : DISCORD_CHANNELID;
	var potential_channels = discord_client.channels.findAll(param, value);
	if (potential_channels.length === 0) {
		console.log("Error: No Discord channels with " + param + " " + value + " found.");
		process.exit(1);
	}
	if (potential_channels.length > 1) {
		console.log("Warning: More than 1 Discord channel with " + param + " " + value + " found.");
		console.log("Defaulting to first one found");
	}
	discord_channel = potential_channels[0];
	console.log("Discord connected");
});

const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(slackSigningSecret);
const port = process.env.PORT || 3000;

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();

slackEvents.on('message',  (async function(message) {
        if (message.type == "message")
        {
			var name = (await getUser(message.user)).user.name;
			var channel = (await getChannel(message.channel)).channel.name;
			var pfp = (await getUser(message.user)).user.profile.image_72;
			
			//connect to channel
			var param = channel !== "" ? "name" : "id";
			var value = channel;
			var potential_channels = discord_client.channels.findAll(param, value);
			if (potential_channels.length === 0) {
				console.log("Error: No Discord channels with " + param + " " + value + " found.");
				process.exit(1);
			}
			if (potential_channels.length > 1) {
				console.log("Warning: More than 1 Discord channel with " + param + " " + value + " found.");
				console.log("Defaulting to first one found");
			}
			discord_channel = potential_channels[0];
			console.log("Connected to channel " + channel);
	
			//send message
			
			var exampleEmbed = new Discord.RichEmbed()
				.setAuthor(name, pfp)
				//.setThumbnail(pfp)
				.setDescription(message.text);
			discord_channel.send(exampleEmbed);
        }
}));


const { WebClient } = require('@slack/web-api');

// Initialize web api
const web = new WebClient(token);

async function getUser(id){
	const thing = await web.users.info({
		user: id,
	});
	return thing;
}

async function getChannel(id){
	const thing = await web.conversations.info({
		channel: id,
	});
	return thing;
}

(async () => {
  console.log((await getUser('UT44N6CT0')).user.name);
})();