const Discord = require('discord.js');
var Chart = require('chart.js');
const league_ID = "RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba";
const bot = new Discord.Client();
var region = "na1";
const request = require('request');
var myModule = require('./champion_images');
var champion_images = myModule.images;
var champions = require('./champions.json');
rankImg = require('./rank_images');
var rankImages = rankImg.rankImages;
var fs = require('fs');
var arrChampImages = require('./champion_array')
var arrImages = arrChampImages.images;
const {
  createCanvas,
  loadImage
} = require('canvas')
var timestamp = require('unix-timestamp');

const token = "NzA0ODg4NzAyNTg1MDEyMzQ1.Xqjs1w.Qu990AZCgIEMHoLSF91Ov-6azag";
bot.login(token);
//
const http = require("http");
var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(server_port , server_host, () => {
});
//
function findChampionName(id) {
  for (i = 0; i < champions.data.length; i++) {
    if (id == Number(champions.data[i].key)) {
      return {"name": champions.data[i].name,
    "title": champions.data[i].title}
    }
  }
}

function player_match_display(info, channelID, id) {
  participantId = -1;
  var summonerName = "";
  let teamId = 0;
  for (var i = 0; i < info.participantIdentities.length; i++) {
    if (id == info.participantIdentities[i].player.accountId) {
      participantId = info.participantIdentities[i].participantId;
      summonerName = info.participantIdentities[i].player.summonerName
      teamId = info.participants[i].teamId;
      break;
    }
  }
  a = [];
  //info.participants[participantId - 1].stats
  championId = info.participants[participantId - 1].championId;
  console.log(championId);
  championName = findChampionName(championId).name;
  var exampleEmbed = new Discord.MessageEmbed();
  if(teamId == 100){
    if(info.teams[0].win == "Fail"){
      exampleEmbed.setColor('#cc0000');
    }
    else{
      exampleEmbed.setColor('#00b30f');
    }
  }
  if(teamId == 200){
    if(info.teams[1].win == "Fail"){
      exampleEmbed.setColor('#cc0000');
    }
    else{
      exampleEmbed.setColor('#00b30f');
    }
  }
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
  let date = timestamp.toDate(info.gameCreation/1000).toString();
  exampleEmbed.setFooter(date.slice(0, 15));
  bot.channels.cache.get(channelID).send(exampleEmbed);
  return 1;
}



function player_match_history_display(body, channelID, id, num) {
  if(body == undefined) return;
  if (num == 10) return;
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
    player_match_history_display(body, channelID, id, num + 1)
  }, 400);

}


function player_match_history(id, channelID, flag) {
  if (flag == 1) return;
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


function draw_champion_graph(body, name, channelID) {
  a = []
  b = []
  var plotly = require('plotly')({
    "username": "heytest970",
    "apiKey": "MWZc5wFpNSDJlkL2RCqQ",
    "host": "chart-studio.plotly.com"
  })
  console.log(body);
  for (let i = 0; i < Math.min(body.length, 10); i++) {
    a.push(findChampionName(body[i].championId).name);
    b.push(body[i].championPoints);
  }
  var trace1 = {
    x: [],
    y: [],
    type: "bar"
  };
  trace1.x = a;
  trace1.y = b;
  var layout = {
    title: name + "'s Champion Masteries",
    xaxis: {
      tickfont: {
        size: 14,
        color: "rgb(107, 107, 107)"
      }
    },
    yaxis: {
      title: "Points",
      titlefont: {
        size: 16,
        color: "rgba(107, 107, 107)"
      },
      tickfont: {
        size: 14,
        color: "rgb(107, 107, 107)"
      }
    },
    legend: {
      x: 0,
      y: 1.0,
      bgcolor: "rgba(255, 255, 255, 0)",
      bordercolor: "rgba(255, 255, 255, 0)"
    },
    barmode: "group",
    bargap: 0.1,
    bargroupgap: 0.1
  };
  var figure = {
    'data': [trace1],
    'layout': layout
  };

  var imgOpts = {
    format: 'png',
    width: 1000,
    height: 500
  };

  plotly.getImage(figure, imgOpts, function (error, imageStream) {
    if (error) return console.log(error);

    var fileStream = fs.createWriteStream('1.png');
    imageStream.pipe(fileStream);
  })
  setTimeout(function () {
    const attachment = new Discord.MessageAttachment('./1.png');
    bot.channels.cache.get(channelID).send(attachment);

  }, 2000);




}

function draw_champion_card(body, channelID) {

  const width = 600
  const height = 300
  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')
  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#fff'
  context.fillText('flaviocopes.com', 600, 530)
  if (body.length < 3) {
    bot.channels.cache.get(channelID).send("Not enough champs have been played!");
    return;
  }
  var champ1 = findChampionName(body[0].championId).name;
  var champ1lvl = body[0].championLevel;
  var champ2 = findChampionName(body[1].championId).name;
  var champ2lvl = body[1].championLevel;
  var champ3 = findChampionName(body[2].championId).name;
  var champ3lvl = body[2].championLevel;

  loadImage('img/champion_loading_images_cropped/' + champ1 + ".png").then(image => {
    context.drawImage(image, 0, 0, 200, 300)
    context.fillStyle = 'rgba(225,225,225,0.5)';
  })
  loadImage('img/champion_loading_images_cropped/' + champ2 + ".png").then(image => {
    context.drawImage(image, 200, 0, 200, 300)
  })
  loadImage('img/champion_loading_images_cropped/' + champ3 + ".png").then(image => {
    context.drawImage(image, 400, 0, 200, 300)
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(0, 0, 600, 300);
    loadImage('img/champion_mastery/' + champ1lvl + ".png").then(image => {
      context.drawImage(image, 100 - image.naturalWidth / 2, 150 - image.naturalHeight / 2)

      context.fillStyle = 'rgba(255,255,255, 1)';
      context.font = '25px Calibri';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText('Points:' + body[0].championPoints, canvas.width / 2 - 200, canvas.height / 2 + 100);
    })

    loadImage('img/champion_mastery/' + champ2lvl + ".png").then(image => {
      context.drawImage(image, 300 - image.naturalWidth / 2, 150 - image.naturalHeight / 2)
      context.fillStyle = 'rgba(225,225,225, 1)';
      context.font = '25px Calibri';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText('Points:' + body[1].championPoints, canvas.width / 2, canvas.height / 2 + 100);
    })

    loadImage('img/champion_mastery/' + champ3lvl + ".png").then(image => {
      context.drawImage(image, 500 - image.naturalWidth / 2, 150 - image.naturalHeight / 2)
      context.fillStyle = 'rgba(225,225,225,1)';
      context.font = '25px Calibri';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText('Points:' + body[2].championPoints, canvas.width / 2 + 200, canvas.height / 2 + 100);
      const buffer = canvas.toBuffer('image/png')
      fs.writeFileSync('js/test.png', buffer)
    })
  })

  const attachment = new Discord.MessageAttachment('js/test.png');
  // Send the attachment in the message channel with a content
  bot.channels.cache.get(channelID).send(attachment);
}

function get_champion_points(body, channelID, name, flag) {
  if (flag == 1) return;
  // https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/CenouAkdk39tnrYO-oMtpW4XmZQvpr8dOZENgTOKIZiZkJM
  request("https://" + region + ".api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + body.id + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    draw_champion_card(body, channelID);
    draw_champion_graph(body, name, channelID)
  });
}

function get_player_id(name, channelID, purpose) {
  if(name == null) return;
  request("https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    console.log(err);

    var flag = 0;
    if (body == undefined) {
      bot.channels.cache.get(channelID).send("An error has occurred!");
      return;
    }
    if (body != undefined && body.status != undefined && body.status.message == 'Data not found - summoner not found') {
      bot.channels.cache.get(channelID).send("That summoner does not exist in North America!");
      return;
    }
    if (err) {
      return console.log(err);
    }
    if (purpose == "rank") {
      player_rank_id(body.id, channelID, body.name, flag);
    }
    if (purpose == "match_history") {
      player_match_history(body.accountId, channelID, flag);
    }
    if (purpose == "profile") {
      get_champion_points(body, channelID, body.name, flag);
    }
  });
}

function player_rank(name, channelID) {
  //  https: //<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key>
  get_player_id(name, channelID, "rank");
}

function player_rank_id(id, channelID, summonerName, flag) {
  if (flag == 1) return;
  // https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/q3X2__q-84mDXMRjIzfsDkpvAe7lHufCBsyIhlZfR4675bQ?api_key=RGAPI-2d5ee199-0a87-48a5-8aea-3c1c5fb4e9f3
  request("https://" + region + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    console.log(body);
    if (err) {
      return console.log(err);
    }
    if (body.length == 0) {
      bot.channels.cache.get(channelID).send("Not Ranked!");
    }
    var exampleEmbed = new Discord.MessageEmbed();
    if (body.length == 1) {
      var queueType = "";
      if (body[0].queueType == "RANKED_SOLO_5x5") {
        queueType = "Ranked Solo";
      } else {
        queueType = "Ranked Flex";
      }

      if (body[0].tier == "IRON") {
        exampleEmbed.setColor('#452700');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "IRON " + body[1].rank);

      }
      if (body[0].tier == "BRONZE") {
        exampleEmbed.setColor('#7a5312');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "BRONZE " + body[0].rank);
      }
      if (body[0].tier == "SILVER") {
        exampleEmbed.setColor('#a0a9b8');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "SILVER " + body[0].rank);
      }
      if (body[0].tier == "GOLD") {
        exampleEmbed.setColor('#edb14c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "GOLD " + body[0].rank);
      }
      if (body[0].tier == "PLATINUM") {
        exampleEmbed.setColor('#003b2b');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "PLATINUM " + body[0].rank);
      }
      if (body[0].tier == "DIAMOND") {
        exampleEmbed.setColor('#390ee6');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "DIAMOND " + body[0].rank);
      }
      if (body[0].tier == "MASTER") {
        exampleEmbed.setColor('#8e19bd');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "MASTER " + body[0].rank);
      }

      if (body[0].tier == "GRANDMASTER") {
        exampleEmbed.setColor('#bd191c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "GRANDMASTER " + body[0].rank);

      }
      if (body[0].tier == "CHALLENGER") {
        exampleEmbed.setColor('#055e9ec');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "CHALLENGER " + body[0].rank);

      }

      exampleEmbed.addFields(
        {
          name: "LP",
          value: body[0].leaguePoints
        },
        {
        name: 'Wins',
        value: body[0].wins,
        inline: true
      }, {
        name: 'Losses',
        value: body[0].losses,
        inline: true
      }, );
      exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      bot.channels.cache.get(channelID).send(exampleEmbed);
    }
    if (body.length == 2) {
      var queueType = "";
      var queueType1 = "";
      if (body[0].queueType == "RANKED_SOLO_5x5") {
        queueType = "Ranked Solo";
      } else {
        queueType = "Ranked Flex";
      }
      if (body[1].queueType == "RANKED_SOLO_5x5") {
        queueType1 = "Ranked Solo";
      } else {
        queueType1 = "Ranked Flex";
      }
      if (body[0].tier == "IRON") {
        exampleEmbed.setColor('#452700');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "IRON " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "BRONZE") {
        exampleEmbed.setColor('#7a5312');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "BRONZE " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "SILVER") {
        exampleEmbed.setColor('#a0a9b8');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "SILVER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "GOLD") {
        exampleEmbed.setColor('#edb14c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "GOLD " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "PLATINUM") {
        exampleEmbed.setColor('#003b2b');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "PLATINUM " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "DIAMOND") {
        exampleEmbed.setColor('#390ee6');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "DIAMOND " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "MASTER") {
        exampleEmbed.setColor('#8e19bd');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "MASTER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }

      if (body[0].tier == "GRANDMASTER") {
        exampleEmbed.setColor('#bd191c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "GRANDMASTER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      if (body[0].tier == "CHALLENGER") {
        exampleEmbed.setColor('#055e9ec');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "CHALLENGER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
      }
      exampleEmbed.addFields({
        name: "LP",
        value: body[0].leaguePoints,
        inline: true
      },
      {
        name: 'Wins',
        value: body[0].wins,
        inline: true
      }, {
        name: 'Losses',
        value: body[0].losses,
        inline: true
      }, );
      bot.channels.cache.get(channelID).send(exampleEmbed);
      var exampleEmbed = new Discord.MessageEmbed();
      if (body[1].tier == "IRON") {
        exampleEmbed.setColor('#452700');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "IRON " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[1].tier == "BRONZE") {
        exampleEmbed.setColor('#7a5312');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "BRONZE " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      if (body[1].tier == "SILVER") {
        exampleEmbed.setColor('#a0a9b8');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "SILVER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      if (body[1].tier == "GOLD") {
        exampleEmbed.setColor('#edb14c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "GOLD " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      if (body[1].tier == "PLATINUM") {
        exampleEmbed.setColor('#003b2b');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "PLATINUM " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      if (body[1].tier == "DIAMOND") {
        exampleEmbed.setColor('#390ee6');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "DIAMOND " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      if (body[1].tier == "MASTER") {
        exampleEmbed.setColor('#8e19bd');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "MASTER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }

      if (body[1].tier == "GRANDMASTER") {
        exampleEmbed.setColor('#bd191c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "GRANDMASTER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      if (body[1].tier == "CHALLENGER") {
        exampleEmbed.setColor('#055e9ec');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "CHALLENGER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
      }
      exampleEmbed.addFields({
        name: "LP",
        value: body[1].leaguePoints,
        inline: true
      },{
        name: 'Wins',
        value: body[1].wins,
        inline: true
      }, {
        name: 'Losses',
        value: body[1].losses,
        inline: true
      }, );
      bot.channels.cache.get(channelID).send(exampleEmbed);
    }

  });
}


function display_champions(champ_list, channelID) {
  const {
    createCanvas,
    loadImage
  } = require('canvas')
  const width = 600
  const height = 360
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#fff'
  context.fillText('flaviocopes.com', 600, 530)
  for (let i = 0; i < 5; i++) {
    let name = findChampionName(champ_list[i]).name;
    loadImage(champion_images[name]).then(image => {
      context.drawImage(image, 0 + 120 * i, 0, 120, 120);
    })
  }
  for (let i = 5; i < 10; i++) {
    let name = findChampionName(champ_list[i]).name;
    loadImage(champion_images[name]).then(image => {
      context.drawImage(image, 0 + 120 * (i - 5), 120, 120, 120);
    })
  }
  for (let i = 10; i < 15; i++) {
    console.log(champ_list[i])
    let name = findChampionName(champ_list[i]).name;
    loadImage(champion_images[name]).then(image => {
      context.drawImage(image, 0 + 120 * (i - 10), 240, 120, 120);
    })
  }
  setTimeout(function () {
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./test1.png', buffer)
  }, 2000);
  const attachment = new Discord.MessageAttachment('./test1.png');
  // Send the attachment in the message channel with a content
  bot.channels.cache.get(channelID).send(attachment);
}

function get_champion_rotations(channelID) {
  request("https://" + region + ".api.riotgames.com/lol/platform/v3/champion-rotations" + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    display_champions(body.freeChampionIds, channelID);
  });
}

function get_random_champion(channelID) {
  let len = Math.floor(Math.random() * arrImages.length);
  var exampleEmbed = new Discord.MessageEmbed();
  exampleEmbed.setColor('#7a5312');
  exampleEmbed.setTitle(arrImages[len]);
  exampleEmbed.setThumbnail(champion_images[arrImages[len]]);
  bot.channels.cache.get(channelID).send(exampleEmbed);
}

function send_message(message, channelID) {
  bot.channels.cache.get(channelID).send(message);
}

function get_help(channelID){
  var exampleEmbed = new Discord.MessageEmbed();
  exampleEmbed.setTitle("GROMP Help");
  exampleEmbed.addField('!match_history <champion name>', 'Finds match history of champion', true);
  exampleEmbed.addField('\u200B', '\u200B')
  exampleEmbed.addField('!profile <champion name>', 'Provide champion mastery information', true);
  exampleEmbed.addField('\u200B', '\u200B')
  exampleEmbed.addField('!match_history <champion name>', 'Finds match history of champion', true);
  exampleEmbed.addField('\u200B', '\u200B')
  exampleEmbed.addField('!rotation', 'Returns champions in the current rotation', true);
  exampleEmbed.addField('\u200B', '\u200B')
  exampleEmbed.addField('!random', 'Returns a random champion', true);
  exampleEmbed.addField('\u200B', '\u200B')
  exampleEmbed.addField('!help', 'List of commands', true);
  bot.channels.cache.get(channelID).send(exampleEmbed);
}

bot.on('message', (msg) => {
  if (msg.content == "!setup") {
    console.log("S");
    send_message("Great, the bot will send messages to this channel", msg.channel.id);
  }
  if (msg.content.split(" ")[0] == "!rank") {
    console.log("S");
    player_rank(msg.content.slice(6, msg.content.length), msg.channel.id);
  }
  if (msg.content.split(" ")[0] == "!change_region") {
    console.log("S");
    region = msg.content.slice(15, msg.content.length);
  }
  if (msg.content.split(" ")[0] == "!match_history") {
    console.log("S");
    get_player_id(msg.content.slice(15, msg.content.length), msg.channel.id, "match_history");
  }
  if (msg.content.split(" ")[0] == "!profile") {
    console.log("S");
    get_player_id(msg.content.slice(9, msg.content.length), msg.channel.id, "profile");
  }
  if (msg.content.split(" ")[0] == "!stats") {
    get_player_id(msg.content.slice(7, msg.content.length), msg.channel.id, "stats");
  }
  if (msg.content.split(" ") == "!rotation") {
    get_champion_rotations(msg.channel.id)
  }
  if (msg.content.split(" ") == "!random") {
    get_random_champion(msg.channel.id);
  }
  if (msg.content.split(" ") == "!help") {
    get_help(msg.channel.id);
  }
});
