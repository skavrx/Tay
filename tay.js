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
    var svrs = Object.keys(bot.servers).length,
        chnnls = Object.keys(bot.channels).length,
        usrs = Object.keys(bot.users).length;
    console.log(String.format(ref.ready_msg, bot.username, bot.id, svrs, chnnls, usrs));
    bot.setPresence({
        game: {
            name: ref.motd
        }
    });
});

// = = = = = = = = =
// Load custom permissions
var dangerousCommands = ["eval", "pullanddeploy", "setUsername"];
var Permissions = {};
try {
    Permissions = require("./permissions.json");
} catch (e) {
    Permissions.global = {};
    Permissions.users = {};
}

for (var i = 0; i < dangerousCommands.length; i++) {
    var cmd = dangerousCommands[i];
    if (!Permissions.global.hasOwnProperty(cmd)) {
        Permissions.global[cmd] = false;
    }
}
Permissions.checkPermission = function(user, permission) {
    try {
        var allowed = true;
        try {
            if (Permissions.global.hasOwnProperty(permission)) {
                allowed = Permissions.global[permission] === true;
            }
        } catch (e) {}
        try {
            if (Permissions.users[user.id].hasOwnProperty(permission)) {
                allowed = Permissions.users[user.id][permission] === true;
            }
        } catch (e) {}
        return allowed;
    } catch (e) {}
    return false;
}
fs.writeFile("./permissions.json", JSON.stringify(Permissions, null, 2));
// = = = = = = = = = = = =

var commands = {
    "info": {
        usage: "info",
        description: "Gives some information about me!",
        process: function(bot, msg) {
            var svrs = Object.keys(bot.servers).length,
                chnnls = Object.keys(bot.channels).length,
                usrs = Object.keys(bot.users).length;

            bot.sendMessage({
                to: msg.channelID,
                embed: {
                    title: "Here's some info about me:",
                    description: String.format("To know what commands I have type \"{0}help\".\nI am currently running on...", ref.prefix),
                    fields: [{
                        name: 'Servers',
                        value: svrs,
                        inline: true
                    }, {
                        name: 'Channels',
                        value: chnnls,
                        inline: true
                    }, {
                        name: 'Users',
                        value: usrs,
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
    },
    "ping": {
        usage: "ping",
        description: "Says pong! (Used to test latency.)",
        process: function(bot, msg) {
            bot.sendMessage({
                to: msg.channelID,
                message: "Pong!"
            });
        }
    },
    "clear": {
      usage: "clear <messages>",
      description: "Clears a certain amount of messages in the channel.",
      process: function(bot, msg) {
          bot.sendMessage({
              to: msg.channelID,
              message: ""
          });
      }
    }
};

function checkIfCommand(msg, isEdit) {
    if (msg.userID == bot.id) {
        return;
    }
    var mention = `<@${bot.id}>`;
    if (msg.message == null) return;
    if (msg.message.indexOf(mention) == -1 && !msg.message.startsWith(ref.prefix)) return;

    var cmdTxt = msg.message.split(" ")[0].substring(1);
    var suffix = msg.message.substring(cmdTxt.length + 2);

    if (msg.message.indexOf(mention) != -1) {
        try {
            cmdTxt = msg.message.split(" ")[1];
            suffix = msg.message.substring(mention.length + cmdTxt.length + 2);
        } catch (e) { //no command
            var msgs = ["Hm?", "What?", "Excuse me?", "What do you want?"];
            var num = Math.floor(Math.random() * msgs.length);
            bot.sendMessage({
                to: msg.channelID,
                message: msgs[num]
            });
            return;
        }
    }

    if (cmdTxt === "help") {
        //help is special since it iterates over the other commands
        if (suffix) {
            var cmds = suffix.split(" ").filter(function(cmd) {
                return commands[cmd]
            });
            var info = "";
            for (var i = 0; i < cmds.length; i++) {
                var cmd = cmds[i];
                info += "**" + ref.prefix + cmd + "**";
                var usage = commands[cmd].usage;
                if (usage) {
                    info += " " + usage;
                }
                var description = commands[cmd].description;
                if (description instanceof Function) {
                    description = description();
                }
                if (description) {
                    info += "\n\t" + description;
                }
                info += "\n"
            }
            bot.sendMessage({
                to: msg.channelID,
                message: info
            });
        } else {
            bot.sendMessage({
                to: msg.channelID,
                message: "**Available Commands:**"
            });
            var batch = "";
            var sortedCommands = Object.keys(commands).sort();
            for (var i in sortedCommands) {
                var cmd = sortedCommands[i];
                var info = "**" + ref.prefix + cmd + "**";
                var usage = commands[cmd].usage;
                if (usage) {
                    info += " " + usage;
                }
                var description = commands[cmd].description;
                if (description instanceof Function) {
                    description = description();
                }
                if (description) {
                    info += "\n\t" + description;
                }
                var newBatch = batch + "\n" + info;
                if (newBatch.length > (1024 - 8)) { //limit message length
                    bot.sendMessage({
                        to: msg.channelID,
                        message: batch
                    });
                    batch = info;
                } else {
                    batch = newBatch
                }
            }
            if (batch.length > 0) {
                bot.sendMessage({
                    to: msg.channelID,
                    message: batch
                });
            }
        }
    } else {
        var cmd = commands[cmdTxt];

        if (Permissions.checkPermission(msg.user, cmdTxt)) {
            try {
                cmd.process(bot, msg);
            } catch (e) {
                var msgTxt = "command " + cmdTxt + " failed :(";
                if (ref.debug) {
                    msgTxt += "\n" + e.stack;
                }
                bot.sendMessage({
                    to: msg.channelID,
                    message: msgTxt
                });
            }
        } else {
          bot.sendMessage({
              to: msg.channelID,
              message: "You do not have permission!"
          });
        }
    }

}

bot.on('message', function(user, userID, channelID, message, event) {
    var msg = {
        user,
        userID,
        channelID,
        message,
        event
    };
    checkIfCommand(msg, false);
});

bot.on('messageUpdate', function(user, userID, channelID, message, event) {
    var msg = {
        user,
        userID,
        channelID,
        message,
        event
    };
    checkIfCommand(msg, true);
});

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

bot.on('disconnect', function(errMsg, code) {
    console.log("I have been disconnected.");
    process.exit(1); //exit node.js with an error
});

bot.on('any', function(event) {
    if (ref.debug) console.log(event); // Log all events if debug is true
});

exports.addCommand = function(commandName, commandObject){
    try {
        commands[commandName] = commandObject;
    } catch(err){
        console.log(err);
    }
}
exports.commandCount = function(){
    return Object.keys(commands).length;
}
