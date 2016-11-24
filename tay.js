var discordio = require('discord.io');
var fs = require("fs");

var ref = require("./ref.json");

var bot = new discordio.Client({
    token: ref.token,
    autorun: true
});

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] :
                match;
        });
    };
}

bot.on('ready', function() {
    var ser = Object.keys(bot.servers).length;
    console.log(String.format(ref.ready_msg, bot.username, bot.id, ser));
    bot.setPresence({
        game: {
            name: ref.motd
        }
    });
});

bot.on('message', function(user, userID, channelID, message, event) {
    if (message == 'test' && ref.testcmd) {

    }
});

bot.on('presence', function(user, userID, status, game, event) {});

bot.on('guildMemberAdd', function(event) {
    if (ref.debug) console.log(event);
    var serverID = event.guild_id;
    bot.sendMessage({
        to: serverID,
        embed: {
            title: String.format(ref.welcome_msg.title, bot.users[event.id].id, bot.servers[serverID].name),
            description: String.format(ref.welcome_msg.description),
            thumbnail: {
                url: 'https://cdn.discordapp.com/avatars/' + event.id + '/' + bot.users[event.id].avatar + '.jpg',
                width: 100,
                height: 100
            },
            color: parseInt('1E90FF', 16),
            timestamp: new Date()
        }
    });
});

bot.on('guildMemberRemove', function(event) {
    if (ref.debug) console.log(event);
    var serverID = event.guild_id;
    console.log(serverID);
    bot.sendMessage({
        to: serverID,
        embed: {
            title: String.format(ref.leave_msg.title, bot.users[event.id].username),
            description: String.format(ref.leave_msg.description),
            thumbnail: {
                url: 'https://cdn.discordapp.com/avatars/' + event.id + '/' + bot.users[event.id].avatar + '.jpg',
                width: 100,
                height: 100
            },
            color: parseInt('1E90FF', 16),
            timestamp: new Date()
        }
    });
});

bot.on('disconnect', function(errMsg, code) {});

bot.on('any', function(event) {
  if (ref.debug) console.log(event); // Log all events if debug is true
});
