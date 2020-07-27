<h1 align="center">
  <br>
  <a href="http://www.gromp.xyz"><img src="https://github.com/Dhruv-m-Shah/League-of-Legends-Discord-Bot/blob/master/readmeImages/gromp_name.png" alt="Gromp" width="400"></a>

</h1>
<h4 align="center">Discord Bot to track, analyze, and showcase player statistics from VALORANT* and LEAGUE OF LEGENDS </h4>
<h5 align="center">*UPDATE: VALORANT API has just been released, valorant functionality is currently in development.</h5>

![Bot Demo](https://github.com/Dhruv-m-Shah/League-of-Legends-Discord-Bot/blob/master/readmeImages/2020-06-24-23-55-17_Trim-_online-video-cutter.com_-_1_.gif)

## Get Discord Bot
Get the bot [here](https://discord.com/oauth2/authorize?client_id=704888702585012345&permissions=0&scope=bot) <br>
Learn about bot commmands [here](http://www.gromp.xyz/Documentation/start.html)


## Whats to come
- [ ] Including VALORANT statistics (Will be released once RIOT VALORANT API is out)
- [ ] A more detailed version of profile information, with more added info-graphics.
- [ ] Upcoming Esports games/tournaments.
- [ ] Provide bot in multiple languages.

## Bug reports and feature suggestions
- Email me me at: dsds4450@gmail.com or create a Github Issue.

## Credits
Thanks to Alex, Anthony, Jaxen, and Nethu for helping me develop this bot.

## How it works
Backend is developed using NodeJS leveraging the DiscordJS and RIOT APIs. When a user types a command into discord, the command is processed and a HTTP request is sent to the RIOT API. Graphs are generated using [plotly](https://plotly.com/nodejs/) and info-graphics are generated through nodejs [canvas](https://www.npmjs.com/package/canvas). App was deployed on Heroku.


