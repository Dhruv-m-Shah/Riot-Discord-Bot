require('dotenv').config({
  path: 'C:/Users/shahd/Downloads/html5-boilerplate_v7.3.0/.env'
});
var {
  Discord,
  Chart,
  request,
  champion_images,
  champions,
  rankImages,
  fs,
  arrImages,
  convert,
  timestamp,
  championMappings,
  myCache,
  database,
  CanvasRenderService
} = require('./exports.js');
database.dbConnect(); // connect to mongodb database.
const league_ID = process.env.RIOT_API_ID;
const bot = new Discord.Client();
var region = "na1";

const {
  createCanvas,
  loadImage
} = require('canvas')

bot.login(process.env.DISCORD_BOT_ID);
bot.on('ready', () => {
  bot.user.setActivity('gromp.xyz | .help', {
    type: 'WATCHING'
  })
})

const http = require("http");
const {
  insert_in_database
} = require('./db.js');
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
server.listen(server_port, server_host, () => {});
//
function findChampionName(id) {
  for (i = 0; i < champions.data.length; i++) {
    if (id == Number(champions.data[i].key)) {
      return champions.data[i];
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
  championName = findChampionName(championId).name;
  var exampleEmbed = new Discord.MessageEmbed();
  if (teamId == 100) {
    if (info.teams[0].win == "Fail") {
      exampleEmbed.setColor('#cc0000');
    } else {
      exampleEmbed.setColor('#00b30f');
    }
  }
  if (teamId == 200) {
    if (info.teams[1].win == "Fail") {
      exampleEmbed.setColor('#cc0000');
    } else {
      exampleEmbed.setColor('#00b30f');
    }
  }
  exampleEmbed.setAuthor(summonerName + "'s Match History", 'https://i.imgur.com/wSTFkRM.png', 'https://na.op.gg/summoner/userName=' + encodeURIComponent(summonerName.trim()))
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
  let date = timestamp.toDate(info.gameCreation / 1000).toString();
  exampleEmbed.setFooter(date.slice(0, 15) + " UTC-0");
  bot.channels.cache.get(channelID).send(exampleEmbed);
  return 1;
}



function player_match_history_display(body, channelID, id, num) {
  if (body == undefined) return;
  if (num == 10) return;
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
    console.log(i);
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
  let encodedName = convert(name);
  var layout = {
    title: encodedName + "'s Champion Masteries",
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
    imageStream.pipe(fileStream)
    fileStream.on('close', function () {
      const attachment = new Discord.MessageAttachment('./1.png');
      bot.channels.cache.get(channelID).send(attachment);
    });

  })



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

function draw_champion_radar(body, name, channelID){
  console.log(body);
  let champTypes = {};
  for (let i = 0; i < body.length; i++) {
    let key  = findChampionName(body[i].championId).tags;
    for(let j = 0; j < key.length; j++){
      if(!(key[j] in champTypes)){
        champTypes[key[j]] = 1;
      }
      else{
        champTypes[key[j]] += 1;
      }
    }
  }
  let  champRole = [];
  let roleGamesPlayed = [];
  for(let key in champTypes){
    champRole.push(key);
    roleGamesPlayed.push(champTypes[key])
  }


  const width = 400;
    const height = 400;
    const chartCallback = (ChartJS) => {

      // Global config example: https://www.chartjs.org/docs/latest/configuration/
      ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
      // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
      ChartJS.plugins.register({
      });
      // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
      ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
        // chart implementation
      });
    };
    const canvasRenderService = new CanvasRenderService(width, height, chartCallback);

    (async () => {
      const configuration = {
        type: 'radar',
        data: {
          labels: champRole,
          datasets: [{
            label: "Student A",
            backgroundColor: "rgba(200,0,0,0.2)",
            data: roleGamesPlayed
          }]
        }
      };
      const image = await canvasRenderService.renderToBuffer(configuration);
      const width = 400
      const height = 400
      const canvas = createCanvas(width, height)
      const context = canvas.getContext('2d')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      loadImage(image).then(image => {
        context.drawImage(image, 0, 0);
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
        bot.channels.cache.get(channelID).send(`Welcome`, attachment);
      })
    })();


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
    draw_champion_graph(body, name, channelID);
    draw_champion_radar(body, name, channelID);
    

  });
}

function get_player_id(name, channelID, purpose) {
  return new Promise((resolve, reject) => {
    if (name == null) resolve(-1);
    request("https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + encodeURIComponent(name) + "?api_key=" + league_ID, {
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
        return resolve(-1);
      }
      if (err) {
        console.log(err);
        return resolve(-1);
      }
      if (purpose == "insert") {
        resolve(body.id);
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
      return resolve(1);
    });
  });
}

function player_rank(name, channelID) {
  //  https: //<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key>
  get_player_id(name, channelID, "rank");
}

async function player_rank_id(id, channelID, summonerName, flag, requestType) {
  return new Promise((resolve, reject) => {
    if (flag == 1) resolve();
    request("https://" + region + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + league_ID, {
      json: true
    }, (err, res, body) => {
      if (err) {
        console.log(err)
        reject();
      }
      if (body.length == 0) {
        if (!requestType) {
          bot.channels.cache.get(channelID).send("Not Ranked!");
        }
        return resolve("Not Ranked!");
      }
      if (requestType == "solo") {
        if (body[0].queueType == "RANKED_SOLO_5x5") {
          return resolve(body[0].tier + " " + body[0].rank)
        }
        if (body.length > 1) {
          return resolve(body[1].tier + " " + body[1].rank)
        }
      }
      if (requestType == "flex") {
        if (body[0].queueType != "RANKED_SOLO_5x5") {
          resolve(body[0].tier + " " + body[0].rank)
        }
        if (body.length > 1) {
          resolve(body[1].tier + " " + body[1].rank)
        }
        return;
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
          exampleEmbed.setTitle(queueType + ": " + "IRON " + body[0].rank);

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
          name: "LP",
          value: body[0].leaguePoints
        }, {
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
        }, {
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
        }, {
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
      resolve(-1);
    });

  })
}


function display_champions(champ_list, channelID) {
  if (myCache.get("rotation") != null) {
    let currentRotation = myCache.get("rotation");
    for (let i = 0; i < champ_list.length; i++) {
      if (!currentRotation.includes(champ_list[i])) {
        break;
      }
      if (i == champ_list.length - 1) {
        const attachment = new Discord.MessageAttachment('./test1.png');
        bot.channels.cache.get(channelID).send(attachment);
        return;
      }
    }
  }
  myCache.set("rotation", champ_list);
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
    let name = findChampionName(champ_list[i]).name;
    loadImage(champion_images[name]).then(image => {
      context.drawImage(image, 0 + 120 * (i - 10), 240, 120, 120);
    })
  }
  setTimeout(function () {
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./test1.png', buffer)
    const attachment = new Discord.MessageAttachment('./test1.png');
    // Send the attachment in the message channel with a content
    bot.channels.cache.get(channelID).send(attachment);
  }, 2000);

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

function compare(a, b) {
  let comparison = 0;
  if (a[0] > b[0]) {
    comparison = 1;
  } else if (a[0] < b[0]) {
    comparison = -1;
  }
  return comparison;
}

async function display_rank_stats(champInfo, channelID, rankType) {
  if (rankType[0] == "rankSolo") {
    ranks = []
    let hierarchy = ["Not Ranked!", "IRON IV", "IRON III", "IRON II", "IRON I", "BRONZE IV", "BRONZE III", "BRONZE II", "BRONZE I", "SILVER IV", "SILVER III", "SILVER II", "SILVER I", "GOLD IV", "GOLD III", "GOLD II", "GOLD I", "PLATINUM IV", "PLATINUM III", "PLATINUM II", "PLATINUM I", "DIAMOND IV", "DIAMOND III", "DIAMOND II", "DIAMOND I", "MASTER IV", "MASTER III", "MASTER II", "MASTER I", "GRANDMASTER IV", "GRANDMASTER III", "GRANDMASTER II", "GRANDMASTER I", "CHALLENGER IV", "CHALLENGER III", "CHALLENGER II", "CHALLENGER I"];
    for (let i = 0; i < champInfo.length; i++) {
      let name = champInfo[i].name;
      let rank = await player_rank_id(champInfo[i].id, channelID, name, 0, "solo")
      let rankNumber = hierarchy.indexOf(rank);
      ranks.push([rankNumber, name]);
      if (i == champInfo.length - 1) {
        ranks.sort(compare);
        var exampleEmbed = new Discord.MessageEmbed();
        exampleEmbed.setTitle("Summoner Solo Ranking");
        let value = "";
        rankStr = ""
        for (let i = ranks.length - 1; i >= 0; i--) {
          value += ranks[i][1] + '\n';
          rankStr += hierarchy[ranks[i][0]] + '\n';
        }
        exampleEmbed.addField("Summoner Name", value, true);
        exampleEmbed.addField("Solo Rankings", rankStr, true);
        bot.channels.cache.get(channelID).send(exampleEmbed);
      }
    }

  }
}

function send_message(message, channelID) {
  bot.channels.cache.get(channelID).send(message);
}

function get_help(channelID) {
  var exampleEmbed = new Discord.MessageEmbed();
  exampleEmbed.setTitle("GROMP Help");
  exampleEmbed.setURL('http://www.gromp.xyz/Documentation/start.html')
  exampleEmbed.addField("Visit this site for more info", "http://www.gromp.xyz/Documentation/start.html")
  bot.channels.cache.get(channelID).send(exampleEmbed);
}

function get_champion_info(champion, channelID) {
  console.log(champion);
  let champInfo = {
    Name: '',
    Disc: '',
    Id: '',
    tags: [],
    attack: '',
    defense: '',
    magic: '',
    difficulty: '',
    title: ''
  };
  let marker = 0;
  for (let i = 0; i < champions.data.length; i++) {
    if (champions.data[i].name.toLowerCase() == champion ||
      ((champion in championMappings) && championMappings[champion].toLowerCase() == champions.data[i].name.toLowerCase())) {
      marker = 1;
      champInfo.Name = champions.data[i].name;
      champInfo.Disc = champions.data[i].blurb;
      champInfo.Id = champions.data[i].key;
      for (let j = 0; j < champions.data[i].tags.length; j++) {
        if (j != 0) champInfo.tags += ", " + champions.data[i].tags[j]
        else champInfo.tags = champions.data[i].tags[j]
      }
      champInfo.tags = champions.data[i].tags;
      champInfo.attack = champions.data[i].info.attack;
      champInfo.defense = champions.data[i].info.defense;
      champInfo.magic = champions.data[i].info.magic;
      champInfo.difficulty = champions.data[i].info.difficulty;
      champInfo.title = champions.data[i].title;
    }
  }
  if (marker == 0) {
    bot.channels.cache.get(channelID).send("That champion is not found!");
    return;
  }
  var exampleEmbed = new Discord.MessageEmbed();
  exampleEmbed.setTitle(champInfo.Name);
  exampleEmbed.setThumbnail(champion_images[champInfo.Name]);
  let temp = champInfo.Name.replace("'", "-");
  temp = temp.replace(" ", "-");
  if (champInfo.Name == "Nunu & Willump") temp = "nunu";
  exampleEmbed.setURL("https://na.leagueoflegends.com/en-us/champions/" + temp.toLowerCase() + "/");
  exampleEmbed.addFields({
    name: 'Description',
    value: champInfo.Disc
  }, {
    name: 'Type',
    value: champInfo.tags,
    inline: true
  }, {
    name: "Difficulty",
    value: champInfo.difficulty,
    inline: true
  }, {
    name: "Title",
    value: champInfo.title,
    inline: true
  }, {
    name: "Attack",
    value: champInfo.attack,
    inline: true
  }, {
    name: "Defense",
    value: champInfo.defense,
    inline: true
  }, {
    name: "Magic",
    value: champInfo.magic,
    inline: true
  }, )
  bot.channels.cache.get(channelID).send(exampleEmbed);
}

bot.on('message', async (msg) => {
  if (msg.content == "!setup") {
    send_message("Great, the bot will send messages to this channel", msg.channel.id);
  }
  if (msg.content.split(" ")[0] == ".rank") { //
    player_rank(msg.content.slice(6, msg.content.length), msg.channel.id);
  }
  if (msg.content.split(" ")[0] == ".change_region") {
    region = msg.content.slice(15, msg.content.length);
  }
  if (msg.content.split(" ")[0] == ".match_history") { //
    get_player_id(msg.content.slice(15, msg.content.length), msg.channel.id, "match_history");
  }
  if (msg.content.split(" ")[0] == ".profile") { //
    get_player_id(msg.content.slice(9, msg.content.length), msg.channel.id, "profile");
  }
  if (msg.content.split(" ")[0] == ".stats") {
    get_player_id(msg.content.slice(7, msg.content.length), msg.channel.id, "stats");
  }
  if (msg.content.split(" ") == ".rotation") {
    get_champion_rotations(msg.channel.id)
  }
  if (msg.content.split(" ") == ".random") {
    get_random_champion(msg.channel.id);
  }
  if (msg.content.split(" ") == ".help") {
    get_help(msg.channel.id);
  }
  if (msg.content.split(" ")[0] == ".info") {
    get_champion_info(msg.content.slice(6, msg.content.length).toLowerCase(), msg.channel.id);
  }
  if (msg.content.split(" ")[0] == ".register") {
    database.insert_in_database(msg.content.slice(10, msg.content.length).toLowerCase(), msg.channel.id, msg.guild.id);
  }
  if (msg.content.split(" ")[0] == ".remove") {
    database.delete_from_database(msg.content.slice(8, msg.content.length).toLowerCase(), msg.channel.id, msg.guild.id);
  }
  if (msg.content.split(" ")[0] == ".rankBy") {
    let arr = msg.content.split(" ");
    arr.shift();
    display_rank_stats(await database.query_from_database(msg.guild.id), msg.channel.id, arr);
  }
});

module.exports = {
  get_player_id,
  bot
}
