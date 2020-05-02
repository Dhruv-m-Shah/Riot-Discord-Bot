const Discord = require('discord.js');
const league_ID = "RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba";
const bot = new Discord.Client();
var region = "na1";
const request = require('request');
var myModule = require('./champion_images');
var champion_images = myModule.images;
//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

var champions = require('./champions.json')
//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const token = "NzA0ODg4NzAyNTg1MDEyMzQ1.Xqjs1w.Qu990AZCgIEMHoLSF91Ov-6azag";
bot.login(token);

function findChampionName(id) {
  for (i = 0; i < champions.data.length; i++) {
    if (id == Number(champions.data[i].key)) {
      return champions.data[i].name;
    }
  }
}

function player_match_display(info, channelID, id) {
  participantId = -1;
  var summonerName = "";
  for (var i = 0; i < info.participantIdentities.length; i++) {
    if (id == info.participantIdentities[i].player.accountId) {
      participantId = info.participantIdentities[i].participantId;
      summonerName = info.participantIdentities[i].player.summonerName
      break;
    }
  }
  a = [];
  //info.participants[participantId - 1].stats
  championId = info.participants[participantId - 1].championId;
  championName = findChampionName(championId);
  var exampleEmbed = new Discord.MessageEmbed();
  exampleEmbed.setColor('#0099ff');
  exampleEmbed.setAuthor(summonerName + "'s Match History", 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
  exampleEmbed.setTitle(championName);
  exampleEmbed.setURL('https://na.op.gg/summoner/userName=' + encodeURIComponent(summonerName.trim()));
  exampleEmbed.setDescription(info.participants[participantId - 1].stats.kills + "/" + info.participants[participantId - 1].stats.deaths + "/" + info.participants[participantId - 1].stats.assists);
  exampleEmbed.setThumbnail(champion_images[championName]);
  exampleEmbed.addFields({
    name: 'Gold Earned',
    value: info.participants[participantId - 1].stats.goldEarned,
    inline: true
  }, {
    name: 'Total Damage Dealt',
    value: info.participants[participantId - 1].stats.totalDamageDealt,
    inline: true
  }, );

  exampleEmbed.setImage('')
  exampleEmbed.setTimestamp()
  exampleEmbed.setFooter(info.gameCreation, 'https://i.imgur.com/wSTFkRM.png');
  bot.channels.cache.get(channelID).send(exampleEmbed);
  return 1;
}

function sort_by_time(a) {
  for (i = 0; i < a.length; i++) {
    for (j = i + 1; j < a.length; j++) {
      if (a[j].gameCreation < a[i].gameCreation) {
        var temp = a[j];
        a[j] = a[i];
        a[i] = temp;
      }
    }
  }

  return a;
}

function player_match_history_display(body, channelID, id, num) {
  if(num == 10) return;
  // https://na1.api.riotgames.com/lol/match/v4/matches/3383936225?api_key=RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba
  a = []

  request("https://" + region + ".api.riotgames.com/lol/match/v4/matches/" + body[num].gameId + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    a.push(body);
    player_match_display(body, channelID, id);

  });
  setTimeout(function () {
    player_match_history_display(body, channelID, id, num+1)
  }, 400);

}

function player_match_history_display1(body, channelID, id) {
  // https://na1.api.riotgames.com/lol/match/v4/matches/3383936225?api_key=RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba
  a = []
  for (i = 0; i < Math.min(10, body.length); i++) {
    request("https://" + region + ".api.riotgames.com/lol/match/v4/matches/" + body[i].gameId + "?api_key=" + league_ID, {
      json: true
    }, (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      a.push(body);
      console.log(i);
      if (i == 9) {
        a = sort_by_time(a);
        console.log(a);
      }
      player_match_display(body, channelID, id);

    });

  }
}

function player_match_history(id, channelID) {
  // https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/DI3RMPSbYGrxwmgCIrJ2ibENps34SdvxRIt0DHWJKmpPeO4?api_key=RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba
  request("https://" + region + ".api.riotgames.com/lol/match/v4/matchlists/by-account/" + id + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    player_match_history_display(body.matches, channelID, id, 0);

  });

}

function callback_id(id) {
  return id;
}

function get_player_id(name, channelID, purpose) {
  request("https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    if (purpose == "rank") {
      player_rank_id(body.id, channelID);
    }
    if (purpose == "match_history") {
      player_match_history(body.accountId, channelID);
    }
  });
}

function player_rank(name, channelID) {
  //  https: //<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key>
  get_player_id(name, channelID, "rank");
}

function player_rank_id(id, channelID) {

  // https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/q3X2__q-84mDXMRjIzfsDkpvAe7lHufCBsyIhlZfR4675bQ?api_key=RGAPI-2d5ee199-0a87-48a5-8aea-3c1c5fb4e9f3
  request("https://" + region + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    if (body.length == 0) {
      bot.channels.cache.get(channelID).send("Not Ranked!");
    }
    if (body.length == 1) {
      bot.channels.cache.get(channelID).send("Ranked Solo: " + body[0].tier + " " + body[0].rank);
    }
    if (body.length == 2) {
      bot.channels.cache.get(channelID).send("Ranked Solo: " + body[0].tier + " " + body[0].rank);
      bot.channels.cache.get(channelID).send("Ranked Flexed SR: " + body[1].tier + " " + body[1].rank);
    }


  });
}

function is_player_in_match() {}

function random_champion() {}

function send_message(message, channelID) {
  bot.channels.cache.get(channelID).send(message);
}

bot.on('message', (msg) => {
  if (msg.content == "!setup") {
    send_message("Great, the bot will send messages to this channel", msg.channel.id);
  }
  if (msg.content.startsWith("!rank")) {
    player_rank(msg.content.slice(6, msg.content.length), msg.channel.id);
  }
  if (msg.content.startsWith("!change_region")) {
    region = msg.content.slice(15, msg.content.length);
  }
  if (msg.content.startsWith("!match_history")) {
    get_player_id(msg.content.slice(15, msg.content.length), msg.channel.id, "match_history");
  }
});
