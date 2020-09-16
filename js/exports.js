const Discord = require('discord.js');
var Chart = require('chart.js');
const league_ID = "RGAPI-07670dcd-ddfb-43ae-8b26-c8e56f489dba";
const bot = new Discord.Client();
var region = "na1";
const request = require('request');
var myModule = require('./champion_images');
var champion_images = myModule.images; //
var champions = require('./champions.json'); //
rankImg = require('./rank_images');
var rankImages = rankImg.rankImages;
var fs = require('fs');
var arrChampImages = require('./champion_array')
var arrImages = arrChampImages.images;
var symbols1 = require('./convert_to_text')
let convert = symbols1.convert
var timestamp = require('unix-timestamp');
var champMap = require('./champion_mappings');
var champMappings = champMap.mappings;
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const database = require("./db")
const { CanvasRenderService } = require('chartjs-node-canvas');
module.exports = {
    Discord: Discord,
    Chart: Chart,
    request: request,
    champion_images: champion_images,
    champions: champions,
    rankImages: rankImages,
    fs: fs,
    arrImages: arrImages,
    convert: convert,
    timestamp: timestamp,
    championMappings: championMappings,
    myCache: myCache,
    database: database,
    CanvasRenderService: CanvasRenderService
};
