const http = require('http');
const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client;
const config = require('./config.json');
const bot_id = config.bot_id || process.env.BOT_ID;
const token = config.token || process.env.TOKEN;

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (message.author.id === bot_id) {
		return;
	}
	// usage: > [Title]\n[Content]
	if (message.content.startsWith('> ')) {
		// split message into title and content
		const splitMessage = message.content.split('\n');
		const title = splitMessage.splice(0, 1)[0];
		const content = splitMessage.join('\n');
		try {
			// react with bookmark and cross, and wait for user's reaction
			await message.react('🔖');
			await message.react('❌');
			const filter = (reaction, user) => ['🔖', '❌'].includes(reaction.emoji.name) && user.id;
			const reaction = await (await message.awaitReactions(filter, { max: 1 })).first();

			// fetch message in channel belonging to the bot
			const channelMessages = await message.channel.messages.fetch();
			const botMessage = channelMessages.filter(m => m.author.id === bot_id && m.content.startsWith('####')).first();

			// edit bot message if user react with bookmark, then delete user message
			if (reaction.emoji.name === '🔖') {
				botMessage.edit([botMessage, '', title, content].join('\n'));
			}
			await message.delete();
		}
		catch (error) {
			console.error(error);
		}
	}
	// Usage: !write [content]
	else if (message.content.startsWith('!write ')) {
		try {
			// bot copies user's message and deletes it
			await message.channel.send(message.content.replace('!write ', ''));
			await message.delete();
		}
		catch (error) {
			console.error(error);
		}
	}
});

client.login(token);


const server = http.createServer((req, res) => {
	res.writeHead(200, { 'content-type': 'text/html' });
	fs.createReadStream('index.html').pipe(res);
});

server.listen(process.env.PORT || 3000);