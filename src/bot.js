require('dotenv').config()
const Player = require('./classes/player');
const Twit = require('twit')
const fs = require('fs')
const db = require('./db/players.json')
const utils = require('./utils/utils');
const createImage = require('./utils/createImage');
let actualPlayers = []

/*
-------------JAVASCRIP IS AWESOME WHEN WE TALKING ABOUT MATHS-------------
    If some one whant to use 
    kills... use like this
    player.kills - 1
    Dont ask why, javascript and maths <3<3
*/


let T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

function getUserTwitter(name) {
    return new Promise(async (resolve, reject) => {
        await T.get('statuses/user_timeline', { screen_name: name }, function (err, data, response) {
            if (err) {
                reject(err)
            }

            resolve(data[0].user);

        })
    })
}

async function populateActualPlayers() {
    try {
        let finalArray = await Promise.all(db.players.map(async (player) => {
            let dataFromTwitter = await getUserTwitter(player.name)
            let actualPlayer = new Player(dataFromTwitter, player.alive, player.luck, player.strength, player.kills,player.name)
            return actualPlayer
        }));
        return finalArray
    } catch (error) {
        console.log(error);
    }
}

//array filter to get only alive people. "alivePlayers"
function getAlivePlayers() {
    let alive = actualPlayers.filter((player) => {
        if (player.alive) {
            return player;
        }
    });
    return alive;
}



//REFACTOR PLS
function battle() {
    let playersSelectedToFight = []
    let playersAlive = getAlivePlayers();

    let playerIndexOne = utils.getRandomIntBeetweenNumbers(0, getAlivePlayers.length - 1)
    let playerIndexTwo = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)

    while (playerIndexOne === playerIndexTwo) {
        playerIndexOne = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)
    }

    playersSelectedToFight.push(playersAlive[playerIndexOne])
    playersSelectedToFight.push(playersAlive[playerIndexTwo])

    //RPG AREA
    let actualRatioToWinPlayer0 = 0
    let actualRatioToWinPlayer1 = 0

    //Strength
    let ratioStrengthPlayer0 = playersSelectedToFight[0].strength / playersSelectedToFight[1].strength
    actualRatioToWinPlayer0 = actualRatioToWinPlayer0 + ratioStrengthPlayer0

    let ratioStrengthPlayer1 = playersSelectedToFight[1].strength / playersSelectedToFight[0].strength
    actualRatioToWinPlayer1 = actualRatioToWinPlayer1 + ratioStrengthPlayer1

    //Kills
    let ratioKilssPlayer0 = playersSelectedToFight[0].kills / playersSelectedToFight[1].kills 
    actualRatioToWinPlayer0 = actualRatioToWinPlayer0 + ratioKilssPlayer0

    let ratioKilssPlayer1 = playersSelectedToFight[1].kills / playersSelectedToFight[0].kills 
    actualRatioToWinPlayer1 = actualRatioToWinPlayer1 + ratioKilssPlayer1

    //Normalize
    let normalizedData0 = utils.normalizeData(actualRatioToWinPlayer0, 0, 200)
    let normalizedData1 = utils.normalizeData(actualRatioToWinPlayer1, 0, 200)

    console.log("p0 : " + normalizedData0)
    console.log("p1 : " + normalizedData1)
    
    if (normalizedData0 <= normalizedData1) {
        let dbToSave = setActualDataBase(playersSelectedToFight[0],playersSelectedToFight[1])
        utils.saveDB(dbToSave)
        return {
            "winner": playersSelectedToFight[0].twitter.screen_name,
            "losser": playersSelectedToFight[1].twitter.screen_name
        }
        /*if(playersSelectedToFight[0].luck >= utils.getRandomIntBeetweenNumbers(0,100)){}*/
    } else {
        let dbToSave = setActualDataBase(playersSelectedToFight[1],playersSelectedToFight[0])
        utils.saveDB(dbToSave)
        return {
            "winner": playersSelectedToFight[1].twitter.screen_name,
            "losser": playersSelectedToFight[0].twitter.screen_name
        }
    }
}

function setActualDataBase(win,loss){
    let dbToSave = actualPlayers.map((player) => {
        if (win.twitter.screen_name == player.twitter.screen_name) {
            player.kills = parseInt(player.kills) + 1
        }
        if (loss.twitter.screen_name == player.twitter.screen_name) {
            player.alive = false
        }
        return player
    })
    return { players : dbToSave}
}

function getDataFromDb(screen_name){
    let player = actualPlayers.filter((player) => {
        if(player.twitter.screen_name == screen_name){
            return player
        }
    })
    return player[0]
}

function uploadImageTwitter(post){
    let b64content = fs.readFileSync('./uploads/upload.png', {encoding: 'base64'})

    T.post('media/upload', {media_data : b64content}, function(err,data,response){
        let mediaIdStr = data.media_id_string
        let altText = "Ganador y perdedor"
        let meta_params = { "media_id": mediaIdStr, "alt_text":{"text" : altText} }


        T.post('media/metadata/create', meta_params, (err,data,response) =>{
            if(!err){
                let params = { "status" : post, media_ids:[mediaIdStr] }
                T.post('statuses/update',params,(err,data,response) => {
                    console.log(data)
                    createImage.deleteAllDownloadedImages('./uploads/')
                })
            }
        })
    })

}


(async () => {
    let dataFromTwitter = await populateActualPlayers();
    actualPlayers = dataFromTwitter
    let playersToFight = battle()
    
    await createImage.ProcessAll(getDataFromDb(playersToFight.winner).twitter.profile_image_url, getDataFromDb(playersToFight.losser).twitter.profile_image_url, getDataFromDb(playersToFight.winner).twitter.screen_name, getDataFromDb(playersToFight.losser).twitter.screen_name, () => {
        uploadImageTwitter(`El ganador es ${getDataFromDb(playersToFight.winner).twitter.screen_name}, El perdedor es ${getDataFromDb(playersToFight.losser).twitter.screen_name}`)
        console.log(`El ganador es ${getDataFromDb(playersToFight.winner).twitter.screen_name}\nEl perdedor es ${getDataFromDb(playersToFight.losser).twitter.screen_name}`)
        console.log("Picture created.")
    })

})();