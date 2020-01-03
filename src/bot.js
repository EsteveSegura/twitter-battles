require('dotenv').config()
const Player = require('./classes/player');
const Twit = require('twit')
const db = require('./db/players.json')
const utils = require('./utils/utils');
const createImage = require('./utils/createImage');
let actualPlayers = []

let T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET
})

function getUserTwitter(name){
    return new Promise(async(resolve,reject) => {
        await T.get('statuses/user_timeline', { screen_name: name}, function(err, data, response) {
            if(err){
                reject(err)
            }

            resolve(data[0].user);

        })
    })
}

async function populateActualPlayers(){
    try {
        let finalArray = await Promise.all(db.players.map(async(player) =>{
            let dataFromTwitter = await getUserTwitter(player.name)
            let actualPlayer = new Player(dataFromTwitter, player.alive, player.chanceToStayAlive, player.luck)
            return actualPlayer
        }));
        return finalArray
    } catch (error) {
        console(error);
    }
}

//array filter to get only alive people. "alivePlayers"
function getAlivePlayers(){
    let alive = actualPlayers.filter((player) => {
        if(player.alive){
            return player;
        }
    });
    return alive;
}



//REFACTOR PLS
function battle(){
    let playersSelectedToFight = []
    let playersAlive = getAlivePlayers();

    let playerIndexOne = utils.getRandomIntBeetweenNumbers(0,getAlivePlayers.length-1)
    let playerIndexTwo = utils.getRandomIntBeetweenNumbers(0,playersAlive.length-1)

    while(playerIndexOne === playerIndexTwo ){
        playerIndexOne = utils.getRandomIntBeetweenNumbers(0,playersAlive.length-1)
    }
    
    playersSelectedToFight.push(playersAlive[playerIndexOne])
    playersSelectedToFight.push(playersAlive[playerIndexTwo])

    //RPG AREA

    //RPG AREA

    //sumar al ganador 1kill
    //setear alive del perdedor false.
    return {
        "winner" : {
            "screenName" : playersSelectedToFight[0].twitter.screen_name,
            "avatarProfileUrl" : playersSelectedToFight[0].twitter.profile_image_url
        },
        "losser":{
            "screenName" : playersSelectedToFight[1].twitter.screen_name,
            "avatarProfileUrl" : playersSelectedToFight[1].twitter.profile_image_url
        }
    }
    
}
    

(async () => {
    let dataFromTwitter = await populateActualPlayers();
    actualPlayers = dataFromTwitter
    let playersToFight = battle()

    
    console.log(playersToFight)
    await createImage.ProcessAll(playersToFight.winner.avatarProfileUrl,playersToFight.losser.avatarProfileUrl,playersToFight.winner.screenName,playersToFight.losser.screenName, () => {
        console.log("Picture created.")
    })
    
})();



