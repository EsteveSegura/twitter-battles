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
            let actualPlayer = new Player(dataFromTwitter, player.alive, player.luck, player.strength, player.kills)
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

    /*
            "name": "mangelrogel",
            "alive": false,
            "luck": 100,
            "strength": 20,
            "team" : "Verde",
            "kills" : 0
    */
    //RPG AREA
    console.log()
    let actualRatioToWinPlayer0 = 0
    let actualRatioToWinPlayer1 = 0
    if(playersSelectedToFight[0].strength >= playersSelectedToFight[1].strength){
        let ratioStrength = playersSelectedToFight[0].strength / playersSelectedToFight[1].strength
        actualRatioToWinPlayer0 += Number.parseFloat(ratioStrength.toFixed(2))
        console.log(`fuerza p1: ${playersSelectedToFight[0].strength}, fuerza p2: ${playersSelectedToFight[1].strength} `)
        console.log(actualRatioToWinPlayer0)
    }else{
        let ratioStrength = playersSelectedToFight[1].strength / playersSelectedToFight[0].strength
        actualRatioToWinPlayer1 += Number.parseFloat(ratioStrength.toFixed(2))
        console.log(`fuerza p1: ${playersSelectedToFight[0].strength}, fuerza p2: ${playersSelectedToFight[1].strength} `)
        console.log(actualRatioToWinPlayer1)
    }

    if(playersSelectedToFight[0].kills >= playersSelectedToFight[1].kills){
        let ratioKills = playersSelectedToFight[0].kills / playersSelectedToFight[1].kills
        //console.log(ratioKills)
        actualRatioToWinPlayer0 += Number.parseFloat(ratioKills.toFixed(2))
        console.log(`kills p1: ${playersSelectedToFight[0].kills}, kills p2: ${playersSelectedToFight[1].kills} `)
        console.log(actualRatioToWinPlayer0)
    }else{
        let ratioKills = playersSelectedToFight[1].strength / playersSelectedToFight[0].kills
        //console.log(ratioKills)
        actualRatioToWinPlayer1 += Number.parseFloat(ratioKills.toFixed(2))
        console.log(`kills p1: ${playersSelectedToFight[0].kills}, kills p2: ${playersSelectedToFight[1].kills} `)
        console.log(actualRatioToWinPlayer1)
    }




    //RPG AREA


    let winner = null
    let losser = null
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

    //console.log(getAlivePlayers())
    //console.log(playersToFight)
    /*await createImage.ProcessAll(playersToFight.winner.avatarProfileUrl,playersToFight.losser.avatarProfileUrl,playersToFight.winner.screenName,playersToFight.losser.screenName, () => {
        console.log("Picture created.")
    })*/
    
})();



