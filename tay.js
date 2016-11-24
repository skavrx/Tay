var discordio = require('discord.io');

var botID = "249732813161627660";
var bot = new discordio.Client({
    token: "",
    autorun: true
});

bot.on('ready', function() {
    console.log(bot.username + " (" + bot.id + ") is now online.");
    bot.setPresence({
        game: {
            name: 'life'
        }
    });
});

bot.on('message', function(user, userID, channelID, message, event) {

});
