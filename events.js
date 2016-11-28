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
