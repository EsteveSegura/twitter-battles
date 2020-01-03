require('dotenv').config()
const Player = require('./classes/player');
const Twit = require('twit')
const db = require('./db/players.json')
const utils = require('./utils/utils');
let actualPlayers = []

let T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET
})

function getUserTwitter(name){
    return new Promise(async(resolve,reject) => {
        await T.get('statuses/user_timeline', { Name: 'girlazo'}, function(err, data, response) {
            if(err){
                reject(err)
            }

            resolve(data);
        })
    })
}

async function populateActualPlayers(){
    try {
        let finalArray = await Promise.all(db.players.map(async(player) =>{
            let dataGromTwitter = await getUserTwitter(player.name)
            let actualPlayer = new Player(dataGromTwitter, true, player.chanceToStayAlive, player.luck)
            return actualPlayer
        }));
        return finalArray
    } catch (error) {
        console(error);
    }
}


//REFACTOR PLS
function battle(){
    let playersSelectedToFight = []
    let playerIndexOne = utils.getRandomIntBeetweenNumbers(0,actualPlayers.length-1)
    let playerIndexTwo = utils.getRandomIntBeetweenNumbers(0,actualPlayers.length-1)

    while(playerIndexOne === playerIndexTwo){
        playerIndexOne = utils.getRandomIntBeetweenNumbers(0,actualPlayers.length-1)
    }

    playersSelectedToFight.push(actualPlayers[playerIndexOne])
    playersSelectedToFight.push(actualPlayers[playerIndexTwo])

    console.log(playersSelectedToFight)

    //RPG AREA && LUCK

    
}
    

(async () => {
    let dataFromTwitter = await populateActualPlayers();
    actualPlayers = dataFromTwitter
    battle()
    
    console.log(actualPlayers)
})();