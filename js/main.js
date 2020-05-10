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
var d3 = require("d3");
var fs = require('fs');
//Start


//End
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



function player_match_history_display(body, channelID, id, num) {
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
  if(flag == 1) return;
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
  for (let i = 0; i < Math.min(body.length, 10); i++) {
    a.push(findChampionName(body[i].championId));
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
  console.log(body);
  const {
    createCanvas,
    loadImage
  } = require('canvas')
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
  var champ1 = findChampionName(body[0].championId);
  var champ1lvl = body[0].championLevel;
  var champ2 = findChampionName(body[1].championId);
  var champ2lvl = body[1].championLevel;
  var champ3 = findChampionName(body[2].championId);
  var champ3lvl = body[2].championLevel;
  console.log(champ1, champ2, champ3);

  loadImage('../img/champion_loading_images_cropped/' + champ1 + ".png").then(image => {
    context.drawImage(image, 0, 0, 200, 300)
    context.fillStyle = 'rgba(225,225,225,0.5)';
  })
  loadImage('../img/champion_loading_images_cropped/' + champ2 + ".png").then(image => {
    context.drawImage(image, 200, 0, 200, 300)
  })
  loadImage('../img/champion_loading_images_cropped/' + champ3 + ".png").then(image => {
    context.drawImage(image, 400, 0, 200, 300)
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(0, 0, 600, 300);
    loadImage('../img/champion_mastery/' + champ1lvl + ".png").then(image => {
      context.drawImage(image, 100 - image.naturalWidth / 2, 150 - image.naturalHeight / 2)

      context.fillStyle = 'rgba(255,255,255, 1)';
      context.font = '25px Calibri';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText('Points:' + body[0].championPoints, canvas.width / 2 - 200, canvas.height / 2 + 100);
    })

    loadImage('../img/champion_mastery/' + champ2lvl + ".png").then(image => {
      context.drawImage(image, 300 - image.naturalWidth / 2, 150 - image.naturalHeight / 2)
      context.fillStyle = 'rgba(225,225,225, 1)';
      context.font = '25px Calibri';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText('Points:' + body[1].championPoints, canvas.width / 2, canvas.height / 2 + 100);
    })

    loadImage('../img/champion_mastery/' + champ3lvl + ".png").then(image => {
      context.drawImage(image, 500 - image.naturalWidth / 2, 150 - image.naturalHeight / 2)
      context.fillStyle = 'rgba(225,225,225,1)';
      context.font = '25px Calibri';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText('Points:' + body[2].championPoints, canvas.width / 2 + 200, canvas.height / 2 + 100);
      const buffer = canvas.toBuffer('image/png')
      fs.writeFileSync('./test.png', buffer)
    })
  })



  const attachment = new Discord.MessageAttachment('./test.png');
  // Send the attachment in the message channel with a content
  bot.channels.cache.get(channelID).send(attachment);
}

function get_champion_points(body, channelID, name, flag) {
  if(flag == 1) return;
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

  request("https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + league_ID, {
    json: true
  }, (err, res, body) => {
    console.log(err);
   
    var flag = 0;
    if(body.status != undefined && body.status.message == 'Data not found - summoner not found'){
      bot.channels.cache.get(channelID).send("That summoner does not exist in North America!");
      flag = 1;
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
  if(flag == 1) return;
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

      exampleEmbed.addFields({
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
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "BRONZE") {
        exampleEmbed.setColor('#7a5312');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "BRONZE " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "SILVER") {
        exampleEmbed.setColor('#a0a9b8');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "SILVER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "GOLD") {
        exampleEmbed.setColor('#edb14c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "GOLD " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "PLATINUM") {
        exampleEmbed.setColor('#003b2b');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "PLATINUM " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "DIAMOND") {
        exampleEmbed.setColor('#390ee6');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "DIAMOND " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "MASTER") {
        exampleEmbed.setColor('#8e19bd');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "MASTER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }

      if (body[0].tier == "GRANDMASTER") {
        exampleEmbed.setColor('#bd191c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "GRANDMASTER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      if (body[0].tier == "CHALLENGER") {
        exampleEmbed.setColor('#055e9ec');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType + ": " + "CHALLENGER " + body[0].rank);
        exampleEmbed.setThumbnail(rankImages[body[0].tier + body[0].rank]);
        exampleEmbed.addFields({
          name: 'Wins',
          value: body[0].wins,
          inline: true
        }, {
          name: 'Losses',
          value: body[0].losses,
          inline: true
        }, );
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
      var exampleEmbed = new Discord.MessageEmbed();
      if (body[1].tier == "IRON") {
        exampleEmbed.setColor('#452700');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "IRON " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "BRONZE") {
        exampleEmbed.setColor('#7a5312');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "BRONZE " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "SILVER") {
        exampleEmbed.setColor('#a0a9b8');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "SILVER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "GOLD") {
        exampleEmbed.setColor('#edb14c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "GOLD " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "PLATINUM") {
        exampleEmbed.setColor('#003b2b');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "PLATINUM " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "DIAMOND") {
        exampleEmbed.setColor('#390ee6');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "DIAMOND " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "MASTER") {
        exampleEmbed.setColor('#8e19bd');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "MASTER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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

      if (body[1].tier == "GRANDMASTER") {
        exampleEmbed.setColor('#bd191c');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "GRANDMASTER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
      if (body[1].tier == "CHALLENGER") {
        exampleEmbed.setColor('#055e9ec');
        exampleEmbed.setAuthor(summonerName);
        exampleEmbed.setTitle(queueType1 + ": " + "CHALLENGER " + body[1].rank);
        exampleEmbed.setThumbnail(rankImages[body[1].tier + body[1].rank]);
        exampleEmbed.addFields({
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
  if (msg.content.startsWith("!profile")) {
    get_player_id(msg.content.slice(9, msg.content.length), msg.channel.id, "profile");
  }
  if (msg.content.startsWith("!stats")) {
    get_player_id(msg.contest.slice(7, msg.content.length), msg.channel.id, "stats");
  }
});
