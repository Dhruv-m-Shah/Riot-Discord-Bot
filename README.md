
<h1 align="center">
  <br>
  <a href="https://github.com/Dhruv-m-Shah/Gromp-Riot-Discord-Bot/blob/master/img/grompLogo.png"><img src="https://github.com/Dhruv-m-Shah/Gromp-Riot-Discord-Bot/blob/master/img/grompLogo.png" alt="Markdownify" width="450"></a>

</h1>
<h4 align="center">GROMP is a discord bot that shows player statistics for League of Legends and Valorant through dynamically generated visuals and graphs.</h4>

## Preface

For those who may not be familiar, League of Legends and Valorant are very popular online multiplayer video games developed by RIOT. This bot helps players display, share, and analyze in game stats using player data that is received from RIOT API endpoints.

## Demo
<h1 align="center">
<img src = "https://github.com/Dhruv-m-Shah/Gromp-Riot-Discord-Bot/blob/master/img/grompDemo.gif"></img>
</h1>

## Getting the Gromp Bot
Visit the main site  <a href = "http://www.gromp.xyz/">here</a> <br>
Get the bot <a href = "https://discordapp.com/api/oauth2/authorize?client_id=704888702585012345&permissions=0&scope=bot">here</a> </br>
Read the docs <a href = "http://www.gromp.xyz/Documentation/start.html">here</a>

## Acknowledgements
I would like to thank Alex, Anthony, Nethu and Jaxen for their continuous input in helping me improve this Discord Bot and suggesting new features for me to implement.

## How it works
The bot is built on Node.js using the <a href = "https://developer.riotgames.com/">Riot API</a> to obtain raw player information and <a href = "https://discord.js.org/#/">Discord JS API</a> to integrate with discord. Each time a command is entered through discord the RIOT API is called, and the corresponding graphs and info-graphics are generated through node-canvas and plotly. These images are then sent as a response to the discord channel. Some information is cached to speed up response times.
