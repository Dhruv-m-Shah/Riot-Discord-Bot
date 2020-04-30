const Discord = require('discord.js');
const league_ID = "RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba";
const bot = new Discord.Client();
var region = "na1";
const request = require('request');
//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

const champions = require('./config.json')

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


function player_match_display(info, channelID, id){
    participantId = -1;
    var summonerName = "";
    for(var i = 0; i < info.participantIdentities.length; i++){
        if(id == info.participantIdentities[i].player.accountId){
            participantId = info.participantIdentities[i].participantId;
            summonerName = info.participantIdentities[i].player.summonerName
            break;
        }
    }
    //info.participants[participantId - 1].stats
    var exampleEmbed = new Discord.MessageEmbed();
	exampleEmbed.setColor('#0099ff');
	exampleEmbed.setTitle(summonerName +"'s Match History");
	exampleEmbed.setURL('https://na.op.gg/summoner/userName=' + summonerName);
	exampleEmbed.setDescription('Some description here')
	exampleEmbed.setThumbnail('https://i.imgur.com/wSTFkRM.png')
	exampleEmbed.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	exampleEmbed.addField('Inline field title', 'Some value here', true)
	exampleEmbed.setImage('https://i.imgur.com/wSTFkRM.png')
	exampleEmbed.setTimestamp()
    exampleEmbed.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
    bot.channels.cache.get(channelID).send(exampleEmbed);
}

function player_match_history_display(body, channelID, id){
    console.log(body[0]);
    // https://na1.api.riotgames.com/lol/match/v4/matches/3383936225?api_key=RGAPI-3c101dbf-5174-4cbc-bf4c-33f1210b55ff
    for(i = 0; i < Math.min(10, body.length); i++){
        console.log("https://" + region + ".api.riotgames.com/lol/match/v4/matches/" + body[i].gameId + "?api_key=" + league_ID);
        request("https://" + region + ".api.riotgames.com/lol/match/v4/matches/" + body[i].gameId + "?api_key=" + league_ID, {
            json: true
          }, (err, res, body) => {
            if (err) {
              return console.log(err);
            }
            console.log(body);
            player_match_display(body, channelID, id);
            
          });
    }
}

function player_match_history(id, channelID) {
  // https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/Dd_mu6PdtEC1lWWu9zDAD1G2TS2slPqIkJivZN6UCOIrKmY?api_key=RGAPI-2d5ee199-0a87-48a5-8aea-3c1c5fb4e9f3
  request("https://" + region + ".api.riotgames.com/lol/match/v4/matchlists/by-account/" + id + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log("ADSD");
    console.log(body.matches);
    player_match_history_display(body.matches, channelID, id);
    
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
    console.log(body);
    if(purpose == "rank"){
        player_rank_id(body.id, channelID);
    }
    if(purpose == "match_history"){
        player_match_history(body.accountId, channelID);
    }
  });
}

function player_rank(name, channelID) {
  //  https: //<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key>
  get_player_id(name, channelID, "rank");
}

function player_rank_id(id, channelID) {
  console.log("https://" + region + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + id);
  // https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/q3X2__q-84mDXMRjIzfsDkpvAe7lHufCBsyIhlZfR4675bQ?api_key=RGAPI-2d5ee199-0a87-48a5-8aea-3c1c5fb4e9f3
  request("https://" + region + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
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
  if (msg.content.startsWith("!player_rank")) {
    console.log(msg);
    player_rank(msg.content.slice(13, msg.content.length), msg.channel.id);
  }
  if (msg.content.startsWith("!change_region")) {
    region = msg.content.slice(15, msg.content.length);
  }
  if (msg.content.startsWith("!match_history")) {
    get_player_id(msg.content.slice(15, msg.content.length), msg.channel.id, "match_history");
  }
});
