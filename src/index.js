require('dotenv').config();
const Player = require('./classes/player');
const dataBase = require('./utils/dataBase');
const Twit = require('twit');


let T = new Twit({
     consumer_key: process.env.CONSUMER_KEY,
     consumer_secret: process.env.CONSUMER_SECRET,
     access_token: process.env.ACCESS_TOKEN,
     access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


function getAlivePlayers(db){
     let actualAlivePlayers = db.players.filter((player) => {
          if(player.alive){
               return player
          }
     })
     return actualAlivePlayers;
}

function getUserTwitter(name) {
     return new Promise(async (resolve, reject) => {
         await T.get('statuses/user_timeline', { screen_name: name }, function (err, data, response) {
             if (err) {
                 reject(err);
             }
             resolve(data[0].user);
         });
     });
 }

async function populatePlayers(){
     let db = await dataBase.readDB()
     let actualAlivePlayers = getAlivePlayers(db)

     let players = await Promise.all(actualAlivePlayers.map(async(player) => {
          let userTwitter = await getUserTwitter(player.name)
          let newPlayer = new Player(userTwitter, player.alive, player.luck, player.strength, player.kills, player.name, player.defenseRange)
          return newPlayer
     }));
     
     console.log(players)

     return players
}


populatePlayers()