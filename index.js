#!/usr/bin/env node
var Discord = require("discord.js");
var client = new Discord.Client();
var config = require("./config.json");
const invocation_words = require("./invoke.json");
var $ = require("jquery");
var chatbot_enabled = false;
var request = require("request");
var first_sent = false;
var moment = require("moment");

var fs = require("fs");
client.on("ready", () => {
    client.user.setGame("q!commands | Q.U.I.R.K Bot");
    console.log("Baddie 2 is ready!");
    setInterval(function() {
        request("https://api.twitch.tv/kraken/streams/playQUIRK?client_id="+config.id+"", function(err, res, bdy) {
            if (!bdy) {

            } else {
                if (bdy[0] == "<") {
                    return;
                }
                var data = JSON.parse(bdy);
                if (!data) {
                    if (first_sent) {
                        //do nothing
                    } else {
                    }
                } else {
                    if (data.stream !== null) {
                        if (first_sent) {
                            //do nothing
                        } else {
                            if (data.stream == undefined) return;
                            if (data.stream.stream_type == "live") {
                                var msg = data.stream.channel.status;
                                client.user.setGame(msg, "https://twitch.tv/playQUIRK");
                                client.guilds.get("213073281127940096").channels.get("335190726184796161").send("https://twitch.tv/playQUIRK <--- "+data.stream.channel.status+" is on right now! Click the link to watch the stream on twitch!")
                                first_sent = true;
                            } else {
                                first_sent = false;
                            }
                        }
                    } else {
                        client.user.setGame("q!commands | Q.U.I.R.K Bot");
                    }
                }
            }
        });
    }, 1000)
});

client.on("message", message => {
    var text = fs.readFileSync("./full-list-of-bad-words-text-file_2018_03_26.txt", "utf8");
    text = text.split("\r\n");
    if (message.author.bot) return;
    for (var i = 0; i < text.length; i++) {
        for (var j = 0; j < message.content.split(" ").length; j++) {
            if (message.content.split(" ")[j].toLocaleLowerCase() == text[i]) {
                if (!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return;
                message.channel.send("Hey "+message.author+", that sort of language isn't allowed here so your message has been removed. Please read re-read the rules in #welcome");
                message.delete();
            }
        }
    }
    if (chatbot_enabled) {
        for (var i = 0; i < invocation_words.hello.length; i++) {
            if (message.content.includes(invocation_words.hello[i])) {
                var responses = [
                    "Hi!",
                    "Hi there!",
                    "Ola!",
                    "Hello!",
                    "Hello there!",
                    "Hey! What's up?"
                ]
                message.channel.send(responses[Math.floor(Math.random() * responses.length)]);
            }
        }
        for (var i = 0; i < invocation_words.bye.length; i++) {
            if (message.content.includes(invocation_words.bye[i])) {
                var responses = [
                    "Bye!",
                    "Goodbye!",
                    "I'll catch you on the flippity-flip!",
                    "Adios amigo!",
                    "I'll see you later, aligator!",
                    "I'll see you in a bit!"
                ]
                message.channel.send(responses[Math.floor(Math.random() * responses.length)]);
            }
        }
    }
    //commands
    if (!message.content.startsWith(config.prefix)) return;
    let command = message.content.split(" ")[0];
    command = command.slice(config.prefix.length);
    let args = message.content.split(" ").slice(1);

    //user section
    var cache = [];

    if (command == "registercontest") {
        var role = message.guild.roles.get("444617459551436802");
        if (message.guild.member(message.author).roles.has("444617459551436802")) {
            message.reply("You must have the ``Master of Ceremonies`` role to register a contest.");
            return;
        }
        if (!args[0]) {
            message.reply("You need to have a contest generated from the contest tools that AEJester may have DMed you. Didnt get it? Ping him!");
            return;
        }
        var json_data = JSON.parse(args[0]);
        fs.writeFileSync(`./${json_data.name}.json`, JSON.stringify(json_data), function(err, res) {
            console.log(err);
            console.log(res);
        });
        var names = JSON.parse(fs.readFileSync(`./names.json`, `utf8`));
        names.names.push(json_data.name);
        fs.writeFileSync(`./names.json`, JSON.stringify(names), function(err, res) {
            console.log(err);
            console.log(res);
        });
        message.reply("Contest registered.");
    }
    if (command == "contests") {
        var names = JSON.parse(fs.readFileSync(`./names.json`, `utf8`));
        var messagex = "Here are the contests that were registered. For more informarion, do ``!contest <contest name>``.\n";
        for (var i = 0; i < names.names.length; i++) {
            messagex+=`**${i+1}**. ${names.names[i]}\n`;
        }
        message.channel.send(messagex)
    }
    if (command == "contestkit") {
        message.reply("Sent!");
        message.author.send("Here is the URL for the contest maker: https://ImpressionableSpryWebmaster--five-nine.repl.co")
    }
    if (command == "contest") {
        if (!args[0]) {
            message.reply("You need to specify a contest name. To get a list of all contest names, do ``!contests``.");
            return;
        }
        var names = JSON.parse(fs.readFileSync(`./names.json`, `utf8`));
        var has_occurred = false;
        for (var i = 0; i < names.names.length; i++) {
            if (args[0] == names.names[i]) {
                has_occurred = true;
            }
        }
        if (has_occurred == true) {
            var data = JSON.parse(fs.readFileSync(`./${args[0]}.json`, `utf8`));
            var requirements = data.requirements.split(",");
            var messagex = ""
            for (var i = 0; i < requirements.length; i++) {
                messagex += `${i+1}. ${requirements[i]}\n`
            }
            var embed = new Discord.RichEmbed()
            .addField("Contest Name", data.name)
            .addField("Contest Description", data.description)
            .addField("Contest Type", data.type)
            .addField("Contest Creator", data.creator)
            .addField("Contest Start Date", data.start_date)
            .addField("Contest End Date", data.end_date)
            .addField("Contest Start Time", data.start_time)
            .addField("Contest Judging", data.judges)
            .addField("Contest Requirements", messagex)
            .setColor("PURPLE");
            message.channel.send({embed})
        } else {
            message.reply(`There was no contest found for the query \`\`${args[0]}\`\`. Did you spell it wrong? Did you put in underscores for all spaces?`);
            return;
        }
    }
    if (command == "streamer") {
        var role = message.guild.roles.find("name", "Streamer");
        if (args[0] == "add") {
            message.guild.member(message.author).addRole(role);
            message.react("✅");
        } else if (args[0] == "remove") {
            message.guild.member(message.author).removeRole(role);
            message.react("✅");
        }
    }
    if (command == "steam") {
        var role = message.guild.roles.find("name", "Steam");
        if (args[0] == "add") {
            message.guild.member(message.author).addRole(role);
            message.react("✅");
        } else if (args[0] == "remove") {
            message.guild.member(message.author).removeRole(role);
            message.react("✅");
        }
    }
    if (command == "mobile") {
        var role = message.guild.roles.find("name", "Mobile");
        if (args[0] == "add") {
            message.guild.member(message.author).addRole(role);
            message.react("✅");
        } else if (args[0] == "remove") {
            message.guild.member(message.author).removeRole(role);
            message.react("✅");
        }
    }
    //moderator section

    if (command == "kick") {
        if (!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You do not have the minimum permissions required: ``KICK_MEMBERS``");
        let timestamp = message.createdAt;
        if (!message.guild.member(message.author).hasPermission(0x00000002)) {
            return message.reply("You must have the permission ``KICK_MEMBERS`` to perform that action.")
        }
        if (message.mentions.users.size === 0) {
            return message.reply("Please mention a user to kick.");
        }
        if (!message.guild.member(client.user).hasPermission(0x00000002)) {
            return message.reply("I don't have the permisson ``KICK_MEMBERS``.")
        }
        let kickable = message.guild.member(message.mentions.users.first());
        if (!kickable) {
            return message.reply("Invalid user.");
        }
        let mess1 = message.content.replace("q!kick", "");
        let reason = mess1.replace(args[0], "");
        let kick = new Discord.RichEmbed()
        .setTitle(message.mentions.users.first().username+"#"+message.mentions.users.first().discriminator)
        .setDescription(`Kicked on ${new Date(timestamp)}`)
        .addField("Responsible Mod", message.author.username+"#"+message.author.discriminator, true)
        .addField("Reason", reason, true)
        .setThumbnail(message.mentions.users.first().avatarURL)
        .setColor("ORANGE")
        message.mentions.users.first().send({ embed: kick });
        var channel = message.guild.channels.find("name", "mod-logs").id;
        console.log(channel);
        client.channels.find("id", channel).send({ embed: kick });
        kickable.kick();
        message.reply("Success.");
    }
    if (command == "ban") {
        if (!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You do not have the minimum permissions required: ``KICK_MEMBERS``");
        let timestamp = message.createdAt;
        if (!message.guild.member(message.author).hasPermission(0x00000004)) {
            return message.reply("You must have the permission ``BAN_MEMBERS`` to perform that action.")
        }
        if (message.mentions.users.size === 0) {
            return message.reply("Please mention a user to ban.");
        }
        if (!message.guild.member(client.user).hasPermission(0x00000004)) {
            return message.reply("I don't have the permisson ``BAN_MEMBERS``.")
        }
        let bannable = message.guild.member(message.mentions.users.first());
        if (!bannable) {
            return message.reply("Invalid user.");
        }
        let mess1 = message.content.replace("q!ban", "");
        let reason = mess1.replace(args[0], "");
        let ban = new Discord.RichEmbed()
        .setTitle(message.mentions.users.first().username+"#"+message.mentions.users.first().discriminator)
        .setDescription(`Banned on ${new Date(timestamp)}`)
        .addField("Responsible Mod", message.author.username+"#"+message.author.discriminator, true)
        .addField("Reason", reason, true)
        .setThumbnail(message.mentions.users.first().avatarURL)
        .setColor("DARK_RED")
        message.mentions.users.first().send({ embed: ban });
        var channel = message.guild.channels.find("name", "mod-logs").id;
        console.log(channel);
        client.channels.find("id", channel).send({ embed: ban });
        bannable.ban();
        message.reply("Success.");
    }
    if (command == "warn") {
        if (!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You do not have the minimum permissions required: ``KICK_MEMBERS``");
        let timestamp = message.createdAt;
        if (!message.guild.member(message.author).hasPermission(0x00000002)) {
            message.reply("No permission.");
            return;
        }
        if (message.mentions.users.size === 0) {
            message.reply("Please mention a user to warn.");
            return;
        }
        if (!message.guild.member(client.user).hasPermission(0x00000002)) {
            message.reply("I don't have the permissons.");
            return;
        }
        let kickable = message.guild.member(message.mentions.users.first());
        if (!kickable) {
            message.reply("Invalid user.");
            return;
        }
        let mess1 = message.content.replace("q!warn", "");
        let reason = mess1.replace(args[0], "");
        let warn = new Discord.RichEmbed()
        .setTitle(message.mentions.users.first().username+"#"+message.mentions.users.first().discriminator)
        .setDescription(`Warned on ${new Date(timestamp)}`)
        .addField("Responsible Mod", message.author.username+"#"+message.author.discriminator, true)
        .addField("Reason", reason, true)
        .setThumbnail(message.mentions.users.first().avatarURL)
        .setColor("GOLD")
        message.mentions.users.first().send({ embed: warn });
        var channel = message.guild.channels.find("name", "mod-logs").id;
        console.log(channel);
        client.channels.find("id", channel).send({ embed: warn });
        message.reply("Success.");
    }
    if (command == "chatbot") {
        if (args[0] == "enable") {
            var chatbot_enabled = true;
        } else if (args[0] == "disable") {
            var chatbot_enabled = false;
        }
        message.reply("Done.")
    }
    if (command == "social") {
        message.channel.send("Here are all social accounts for QUIRK: \n\nWeb: https://www.playquirk.com/ \nYouTube: https://www.youtube.com/playQUIRK \nTwitch: https://www.twitch.tv/playquirk \nTwitter: https://twitter.com/PlayQUIRK \nFacebook: https://www.facebook.com/playQUIRK")
    }
    if (command == "download") {
        message.channel.send("Here are the places you can download QUIRK! \n\nGoogle Store: https://play.google.com/store/apps/details?id=com.ugen.playquirk \n\nSteam:  https://store.steampowered.com/app/577210/QUIRK/")
    }
    if (command == "support") {
        message.channel.send("Run into a bug? Don't worry we can help. Please send a support ticket on https://support.playquirk.com/hc/en-us/requests/new{}")
    }
    if (command == "commands") {
        message.reply("Look at your DMs!");
        var embed = new Discord.RichEmbed()
        .setColor("PURPLE")
        .setAuthor("Baddie 2")
        .setDescription("Help for Baddie 2:")
        .addField("Prefix", "!")
        .addField("Arguments", "``<>`` is a required argument, and ``[]`` is an optional one.")
        .addField("streamer <add|remove>", "Adds or removes the ``Streamer`` role from your user.")
        .addField("steam <add|remove>", "Adds or removes the ``Steam`` role from your user.")
        .addField("mobile <add|remove>", "Adds or removes the ``Mobile`` role from your user.")
        .addField("commands", "Shows this messsage.")
        .addField("feedbaddie", "Feeds the beast that runs QUIRK behind the scenes... wait... I've said too much!")
        .addField("download", "Shows you where to get the QUIRK Official game!")
        .addField("support", "Sets you up with a good ol' fashioned support request.")
        .addField("contests", "Lists all the current contests that you can participate in!")
        .addField("social", "Links you to all the social accounts for QUIRK!")
        .addField("registercontest <generated contest data>", "Do ``!contestkit`` for the generator!")
        .addField("contests", "Lists all ongoing *registered* contests!")
        .addField("contest <contest name>", "Searches for the contest and then gives you information on it!")
        .addField("We also have minigames!", "If you feed Baddie enough... he will be your friend! There is only one role to go around... so let the games Begin!")
        .setTitle("Help Message from Baddie 2")
        message.author.send({ embed });
    }
    if (command == "purge") {
        if (!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You do not have the minimum permissions required: ``KICK_MEMBERS``");
        message.channel.bulkDelete(args[0]);
        message.reply("Done!");
    }
    if (chatbot_enabled) {

    } else {

    }
});

client.on("guildMemberAdd", member => {
    member.guild.channels.get("213073281127940096").send(`Welcome ${member} to Q.U.I.R.K. we are thrilled to have you join us! Please take a peek at #welcome for information and rules. Enjoy!`)
});

client.login(config.token);
