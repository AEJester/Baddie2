if (command == "feedbaddie") {
    var cache = [];
    var role = message.guild.roles.find("name", "Baddie Buddy");
    var users = JSON.parse(fs.readFileSync("./fed.json", "utf8"));
    var user_array = users.users;
    var x = false;
    var start = null;
    var total_int = 0;
    if (user_array.length == 0) {
        users.users.push({
            name: message.author.username,
            food_given: 1,
            buddy: false,
            user: message.author.id,
            has_hour: true,
            date_assigned:  moment().format("MMMM Do YYYY, h:mm:ss a")
        });
        message.reply("You have given baddie 1 food!");
        fs.writeFileSync("./fed.json", JSON.stringify(users, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }), function(error, res) {
        })
        cache = null;
        return;
    }
    for (var i = 0; i < user_array.length; i++) {
        if (user_array[i].name == message.author.username) {
            x = true;
            start = i;
        }
    }
    if (x == true) {
        console.log(parseInt(users.users[start].date_assigned.split(" ")[3].split(":")[0]));
        console.log(parseInt(users.users[start].date_assigned.split(" ")[3].split(":")[0])+1);
        console.log(parseInt(moment().format("MMMM Do YYYY, h:mm:ss a").split(" ")[3].split(":")[0]))
        if (parseInt(users.users[start].date_assigned.split(" ")[3].split(":")[0])+1 == parseInt(moment().format("MMMM Do YYYY, h:mm:ss a").split(" ")[3].split(":")[0])) {
            users.users[start].food_given++;
            message.reply("You have given baddie 1 food!");
            users.users[start].has_hour = true;
            users.users[start].date_assigned = moment().format("MMMM Do YYYY, h:mm:ss a");
            return;
        }
        message.reply("You have to wait 1 hour until you can feed baddie again.");
            users.users[start].has_hour = false;
            return;
    } else {
        users.users.push({
            name: message.author.username,
            food_given: 1,
            buddy: false,
            user: message.author.id,
            has_hour: true,
            date_assigned: moment().format("MMMM Do YYYY, h:mm:ss a")
        });
        message.reply("You have given baddie 1 food!");
    }

    for (var i = 0; i < user_array.length; i++) {
        for (var j = 1; j < user_array.length; j++) {
            if (user_array[j-1].food_given < user_array[j].food_given) {
                var temp = users.users[j-1];
                users.users[j-1] = users.users[j];
                users.users[j] = temp;
            }
        }
    }

    if (user_array[1]) {
        if (user_array[0].buddy == true) {
            message.channel.send(user_array[0].name+" is still the **Baddie Buddy** with "+user_array[0].food_given+" food given! See if you can beat 'em!")
        } else {
            users.users[0].buddy = true;
            users.users[1].buddy = false;
            message.guild.members.get(users.users[1].user).removeRole(role);
            message.guild.members.get(users.users[0].user).addRole(role);
            message.channel.send(user_array[0].name+" is now the new **Baddie Buddy** with "+user_array[0].food_given+" food given! See if you can beat 'em!")
        }
    } else {
        users.users[0].buddy = true;
        message.guild.members.get(users.users[0].user).addRole(role);
        message.channel.send(user_array[0].name+" is now the new **Baddie Buddy** with "+user_array[0].food_given+" food given! See if you can beat him!")
    }
    fs.writeFileSync("./fed.json", JSON.stringify(users, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    }), function(error, res) {

    })
    cache = null;
}