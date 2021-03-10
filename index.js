const express = require("express");
const request = require("request");
const Discord = require('discord.js');
const jokes = require('./jokes.json');

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const client = new Discord.Client();

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const refresh_token = process.env.REFRESH_TOKEN;
const pdata = {
    "online": "online",
    "dnd": "on do not disturb",
    "idle": "inactive",
    "offline": "offline"
}
var spotify = {};
var sockets = [];

app.set("view engine", "ejs");
app.use(express.static("static"));

let discordData = {};

client.on('ready', async () => {
    let guild = await client.guilds.fetch("771625972792557588")
    let user = await guild.members.fetch("705080774113886238");

    let activity = user.user.presence.activities.filter((status) => { return status.type === "CUSTOM_STATUS" })[0];
    let game = user.user.presence.activities.filter((status) => { return status.type === "PLAYING" })[0];

    discordData.status = user.user.presence.status;
    if (discordData.status != "offline") {
        if (game)
            discordData.game = {
                name: game.name,
                desc: game.details,
                details: game.largeText,
                imageLink: `https://cdn.discordapp.com/app-assets/${game.applicationID}/${game.assets.largeImage}.png`,
                from: game.createdTimestamp
            }
    } else
        discordData.game = {
            name: "Nothing",
            desc: "Nothing",
            details: "Nothing",
            imageLink: "https://cdn.macedon.ga/p.n.g.r.png",
            from: "Nothing"
        }
    discordData.username = user.user.username;
    discordData.tag = user.user.tag;
    discordData.avatar = user.user.displayAvatarURL({ dynamic: true });

    console.log('Connected!');
});

const getSpotify = async () => {
    return new Promise((resolve) => {
        var authOptions = {
            url: "https://accounts.spotify.com/api/token",
            headers: { "Authorization": "Basic " + (new Buffer.from(client_id + ":" + client_secret).toString("base64")) },
            form: { grant_type: 'refresh_token', refresh_token: refresh_token }
        };

        request.post(authOptions, (error, res) => {
            var header = { "Authorization": "Bearer " + (JSON.parse(res.body)).access_token };

            request({ url: "https://api.spotify.com/v1/me/player/currently-playing?", headers: header }, (error, res, body) => {
                if ((res.statusCode == 204) || JSON.parse(body).currently_playing_type != "track")
                    return resolve({ "success": false, "error": "No music playing" });
                else {
                    var body_text = JSON.parse(body);

                    var song_name = body_text.item.name;
                    var artist = (body_text.item.artists)[0].name;
                    var song_url = body_text.item.external_urls.spotify;
                    var duration_ms = body_text.item.duration_ms;
                    var progress_ms = body_text.progress_ms;
                    var image = body_text.item.album.images[1].url;

                    return resolve({ "success": true, "song_name": song_name, "artist": artist, "song_url": song_url, "progress_ms": progress_ms, "duration_ms": duration_ms, "image": image });
                }
            });
        });
    });
}

client.on("presenceUpdate", (oldMember, newMember) => {
    if (newMember.user.id != "705080774113886238") return;
    let activity = newMember.user.presence.activities.filter((status) => { return status.type === "CUSTOM_STATUS" })[0];
    let game = newMember.user.presence.activities.filter((status) => { return status.type === "PLAYING" })[0];

    discordData.status = newMember.user.presence.status;
    if (discordData.status != "offline") {
        if (game)
            discordData.game = {
                name: game.name,
                desc: game.details,
                details: game.largeText,
                imageLink: `https://cdn.discordapp.com/app-assets/${game.applicationID}/${game.assets.largeImage}.png`,
                from: game.createdTimestamp
            }
    } else
        discordData.game = {
            name: "Nothing",
            desc: "Nothing",
            details: "Nothing",
            imageLink: "assets/images/placeholdergame.png",
            from: "Nothing"
        }
    sockets.forEach((sockets) => {
        sockets.emit("game", discordData);
    });
});

app.get("/", async (req, res) => {
    await HandleSpotify();
    var data = await getSpotify();
    res.render("index", { spotify: data, discord: discordData, joke: jokes[Math.floor(Math.random() * jokes.length)], status: pdata[discordData.status] });
});

app.use((err, req, res, next) => {
    res.status(500).render("error", { error: err.stack });
});

app.use((req, res, next) => {
    res.redirect("/");
});

io.on("connection", (socket) => {
    sockets.push(socket);
});

const HandleSpotify = async (timeout) => {
    if (spotify.success && !timeout) return;
    spotify = await getSpotify();
    if (!spotify.success) return;
    if (timeout) sockets.forEach((sockets) => {
        sockets.emit("music", spotify);
    });
    return setTimeout(() => {
        HandleSpotify(true);
    }, spotify.duration_ms - spotify.progress_ms);
}

client.login(process.env.TOKEN).then(async () => {
    HandleSpotify();
    http.listen(PORT, () => {
        console.log("Listening at http://localhost:" + PORT);
    });
});

process.on('uncaughtException', function (error) {
    console.log(error.stack);
});

process.on('unhandledRejection', function (reason, p) {
    console.log(reason);
});