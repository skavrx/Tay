var ref = require("./ref.json");

function handleCommand(bot, user, userID, channelID, message, event) {
    //if (!message.startsWith(ref.prefix) || !message.startsWith(`<@${bot.id}>`)) return;

    if (!message.startsWith(ref.prefix) && message.indexOf(`<@${bot.id}>`) == -1) return;
    if (message.indexOf('info') != -1) {
        info(bot, user, userID, channelID, message, event);
    } else if (message.indexOf('help') != -1) {
        help(bot, user, userID, channelID, message, event);
    }

}

function test(bot, user, userID, channelID, message, event) {
    bot.sendMessage({
        to: channelID,
        message: "testkek"
    });
}

function help(bot, user, userID, channelID, message, event) {
    var title = "Commands";
    var msg = message;
    if (msg.indexOf(`<@${bot.id}>`) != -1)
        msg = msg.replace(`<@${bot.id}>`, "");
    var msgarr = msg.split(' ');
    bot.sendMessage({
        to: channelID,
        embed: {
            title: title,
            description: String.format("Page ({0}/{1}) | Command Prefix: \"{3}\"", ref.prefix),
            fields: [{
                name: helpref.commands.page["1"].help.name,
                value: "Usage: " + helpref.commands.page["1"].help.usage + "\n" + helpref.commands.page["1"].help.description,
                inline: false
            }, {
                name: helpref.commands.page["1"].info.name,
                value: "Usage: " + helpref.commands.page["1"].info.usage + "\n" + helpref.commands.page["1"].info.description,
                inline: true
            }],
            thumbnail: {
                url: 'https://cdn.discordapp.com/avatars/' + bot.id + '/' + bot.avatar + '.jpg',
                width: 100,
                height: 100
            },
            color: parseInt('1E90FF', 16)
        }
    });
}

function info(bot, user, userID, channelID, message, event) {
    var svrs = Object.keys(bot.servers).length,
        chnnls = Object.keys(bot.channels).length,
        usrs = Object.keys(bot.users).length;

    bot.sendMessage({
        to: channelID,
        embed: {
            title: "Here's some info about me:",
            description: String.format("To know what commands I have type \"{0}help\".\nI am currently running on...", ref.prefix),
            fields: [{
                name: 'Servers',
                value: svrs,
                inline: false
            }, {
                name: 'Channels',
                value: chnnls,
                inline: false
            }, {
                name: 'Users',
                value: usrs,
                inline: false
            }],
            thumbnail: {
                url: 'https://cdn.discordapp.com/avatars/' + bot.id + '/' + bot.avatar + '.jpg',
                width: 100,
                height: 100
            },
            color: parseInt('1E90FF', 16)
        }
    });
}

var commands = [
    "help",
    "info",
    "status"
];

module.exports = {
    handleCommand,
    test
};
