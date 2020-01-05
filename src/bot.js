require('dotenv').config();
const fs = require('fs');
const Twit = require('twit');
const utils = require('./utils/utils');
const db = require('./db/players.json');
const Player = require('./classes/player');
const createImage = require('./utils/createImage');
const timeManager = require('./utils/timeManager');

const valueToNormalize = 100;
const bonusPerKill = 0.05

//GLOBAL AREA
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
                reject(err);
            }
            resolve(data[0].user);
        });
    });
}

async function populateActualPlayers() {
    try {
        let finalArray = await Promise.all(db.players.map(async (player) => {
            let dataFromTwitter = await getUserTwitter(player.name);
            let actualPlayer = new Player(dataFromTwitter, player.alive, player.luck, player.strength, player.kills, player.name, player.defense);
            return actualPlayer;
        }));
        return finalArray;
    } catch (error) {
        console.log(error);
    }
}

function getAlivePlayers() {
    let alive = actualPlayers.filter((player) => {
        if (player.alive) {
            return player;
        }
    });
    return alive;
}

//REFACTOR PLS
function battle(alive) {
    let winner = null;
    let losser = null
    let playersSelectedToFight = []
    let playersAlive = alive;


    let playerIndexOne = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)
    let playerIndexTwo = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)

    while (playerIndexOne === playerIndexTwo) {
        playerIndexOne = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)
    }

    playersSelectedToFight.push(playersAlive[playerIndexOne])
    playersSelectedToFight.push(playersAlive[playerIndexTwo])
    /*
    PlayersSelectsToFight:
    {
        class: player,
        ratiotowin: 0
    }
    */


    //RPG AREA
    //let actualRatioToWinPlayer0 = 0
    //let actualRatioToWinPlayer1 = 0

    //Strength
    playersSelectedToFight[0].getStrength(valueToNormalize);
    playersSelectedToFight[1].getStrength(valueToNormalize);
    console.log('--- Ratio solo fuerza ---');
    console.log(playersSelectedToFight[0].ratioToWin)
    console.log(playersSelectedToFight[0].ratioToWin + " Jugador:" + playersSelectedToFight[0].twitter.screen_name)
    console.log(playersSelectedToFight[1].ratioToWin + " Jugador:" + playersSelectedToFight[1].twitter.screen_name)
    console.log('------');
    //Kills
    playersSelectedToFight[0].getBonusPerKill(bonusPerKill);
    playersSelectedToFight[1].getBonusPerKill(bonusPerKill);
    
        console.log('--- Ratio fuerza + kills ---');
        console.log(playersSelectedToFight[0].ratioToWin + " Jugador:" + playersSelectedToFight[0].twitter.screen_name)
        console.log(playersSelectedToFight[1].ratioToWin + " Jugador:" + playersSelectedToFight[1].twitter.screen_name)
        console.log('------');
    //GetInjured
    

    playersSelectedToFight[0].getInjured(playersSelectedToFight[1].tempRatioToWin,valueToNormalize)
    playersSelectedToFight[1].getInjured(playersSelectedToFight[0].tempRatioToWin,valueToNormalize)

    console.log('--- Ratio fuerza + kills - (daño - (defensa /100))  ---');
    console.log(playersSelectedToFight[0].ratioToWin + " Jugador:" + playersSelectedToFight[0].twitter.screen_name)
    console.log(playersSelectedToFight[1].ratioToWin + " Jugador:" + playersSelectedToFight[1].twitter.screen_name)
    console.log('------');

    if(playersSelectedToFight[0].ratioToWin >= playersSelectedToFight[1].ratioToWin){
        let losserLuck = playersSelectedToFight[1].getLucky()
        console.log(`Ha ganado ${playersSelectedToFight[0].twitter.screen_name}`)
        if(losserLuck){
            console.log(`Pero la suerte de ${playersSelectedToFight[1].twitter.screen_name} es: ${playersSelectedToFight[1].luck} y eso de le ha convertido en ganador`)
            winner = playersSelectedToFight[0]
            losser = playersSelectedToFight[1]
        }
    }else{
        let losserLuck = playersSelectedToFight[0].getLucky()
        console.log(`Ha ganado ${playersSelectedToFight[1].twitter.screen_name}`)
        if(losserLuck){
            console.log(`Pero la suerte de ${playersSelectedToFight[0].twitter.screen_name} es: ${playersSelectedToFight[0].luck} y eso de le ha convertido en ganador`)
            winner = playersSelectedToFight[1]
            losser = playersSelectedToFight[0]
        }
    }

    console.log(`El ganador es ${winner}`)
    console.log(`El perdedor es ${losser}`)


    /*
    let ratioStrengthPlayer0 = playersSelectedToFight[0].strength / 100//playersSelectedToFight[1].strength
    actualRatioToWinPlayer0 = actualRatioToWinPlayer0 + ratioStrengthPlayer0

    let ratioStrengthPlayer1 = playersSelectedToFight[1].strength / 100//playersSelectedToFight[0].strength
    actualRatioToWinPlayer1 = actualRatioToWinPlayer1 + ratioStrengthPlayer1
    */

    //Kills

    /*
    let bonusPerKill0 = playersSelectedToFight[0].kills * 0.05;
    actualRatioToWinPlayer0 = actualRatioToWinPlayer0 + bonusPerKill0;

    let bonusPerKill1 = playersSelectedToFight[1].kills * 0.05;
    actualRatioToWinPlayer1 = actualRatioToWinPlayer1 + bonusPerKill1;

    */

    /*
    console.log("Defense de: " + playersSelectedToFight[0].twitter.screen_name + " " + playersSelectedToFight[0].getRandomDefense() / 100)
    console.log("Defense de: " + playersSelectedToFight[1].twitter.screen_name + " " + playersSelectedToFight[1].getRandomDefense() / 100)
    */
    /*
    actualRatioToWinPlayer0 = actualRatioToWinPlayer0 - (playersSelectedToFight[1].getRandomDefense() / 100)
    actualRatioToWinPlayer1 = actualRatioToWinPlayer1 - (playersSelectedToFight[0].getRandomDefense() / 100)
    



    //Normalize
    let normalizedData0 = utils.normalizeData(actualRatioToWinPlayer0, 0, 200)
    let normalizedData1 = utils.normalizeData(actualRatioToWinPlayer1, 0, 200)

    console.log('---Data Normalizada--')
    console.log(playersSelectedToFight[0].twitter.screen_name + " " + normalizedData0)
    console.log(playersSelectedToFight[1].twitter.screen_name + " " + normalizedData1)

    console.log('--- Ratio global tras aplicar defensa ---');
    console.log(ratioStrengthPlayer0 + " Jugador:" + playersSelectedToFight[0].twitter.screen_name)
    console.log(ratioStrengthPlayer1 + " Jugador:" + playersSelectedToFight[1].twitter.screen_name)

    if (normalizedData0 >= normalizedData1) {


        if (playersSelectedToFight[1].luck >= utils.getRandomIntBeetweenNumbers(0, 100)) {
            console.log("SUERTUDO AQUI CAMBIANDO GANADORES")
            console.log("ganador4" + playersSelectedToFight[1].twitter.screen_name)
            let dbToSave = setActualDataBase(playersSelectedToFight[1], playersSelectedToFight[0])
            utils.saveDB(dbToSave)
            return {
                "winner": playersSelectedToFight[1].twitter.screen_name,
                "losser": playersSelectedToFight[0].twitter.screen_name
            }
        }


        console.log("ganador3" + playersSelectedToFight[0].twitter.screen_name)
        let dbToSave = setActualDataBase(playersSelectedToFight[0], playersSelectedToFight[1])
        utils.saveDB(dbToSave)
        return {
            "winner": playersSelectedToFight[0].twitter.screen_name,
            "losser": playersSelectedToFight[1].twitter.screen_name
        }
    } else {
        if (playersSelectedToFight[0].luck >= utils.getRandomIntBeetweenNumbers(0, 100)) {
            console.log("SUERTUDO AQUI CAMBIANDO GANADORES")
            let dbToSave = setActualDataBase(playersSelectedToFight[0], playersSelectedToFight[1])
            utils.saveDB(dbToSave)
            console.log("ganador2" + playersSelectedToFight[0].twitter.screen_name)
            return {
                "winner": playersSelectedToFight[0].twitter.screen_name,
                "losser": playersSelectedToFight[1].twitter.screen_name
            }
        }
        let dbToSave = setActualDataBase(playersSelectedToFight[1], playersSelectedToFight[0])
        utils.saveDB(dbToSave)
        console.log("ganador1" + playersSelectedToFight[1].twitter.screen_name)
        return {
            "winner": playersSelectedToFight[1].twitter.screen_name,
            "losser": playersSelectedToFight[0].twitter.screen_name
        }
    }*/
}

function setActualDataBase(win, loss) {
    let dbToSave = actualPlayers.map((player) => {
        if (win.twitter.screen_name == player.twitter.screen_name) {
            player.kills = parseInt(player.kills) + 1
        }
        if (loss.twitter.screen_name == player.twitter.screen_name) {
            player.alive = false
        }
        return player
    })
    return { players: dbToSave }
}

function getDataFromDb(screen_name) {
    let player = actualPlayers.filter((player) => {
        if (player.twitter.screen_name == screen_name) {
            return player
        }
    })
    return player[0]
}

function uploadImageTwitter(post) {
    let b64content = fs.readFileSync('./uploads/upload.png', { encoding: 'base64' })

    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
        let mediaIdStr = data.media_id_string
        let altText = "Ganador y perdedor"
        let meta_params = { "media_id": mediaIdStr, "alt_text": { "text": altText } }

        T.post('media/metadata/create', meta_params, (err, data, response) => {
            if (!err) {
                let params = { "status": post, media_ids: [mediaIdStr] }
                T.post('statuses/update', params, (err, data, response) => {
                    console.log(data)
                    createImage.deleteAllDownloadedImages('./uploads/')
                })
            }
        })
    })
}


(async () => {
    setTimeout(async () => {
        console.log("OBTENIENDO DATOS")
        let dataFromTwitter = await populateActualPlayers();
        actualPlayers = dataFromTwitter; //pacth


        let now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let canIDoTheActions = timeManager.checkIfWeAreInTime(hour, minute);


        //TEST AREA
        console.log("ESTOY PASANDO1")
        let actualAlivePlayers = getAlivePlayers()
        console.log("ESTOY PASANDO2")
        let playersToFight = battle(actualAlivePlayers)
        console.log("ESTOY PASANDO3")













        //TEST AREA

        console.log(`son las ${hour}:${minute}. Mi permiso para hacer la acción es: ${canIDoTheActions}`);

        if (canIDoTheActions) {
           
            let actualAlivePlayers = getAlivePlayers()
            let playersToFight = battle(actualAlivePlayers)
            let imageCreated = await createImage.ProcessAll(getDataFromDb(playersToFight.winner).twitter.profile_image_url, getDataFromDb(playersToFight.losser).twitter.profile_image_url, getDataFromDb(playersToFight.winner).twitter.screen_name, getDataFromDb(playersToFight.losser).twitter.screen_name)
            if (actualAlivePlayers.length == 1 && imageCreated) {
                setTimeout(() => {
                    uploadImageTwitter(`El ganador absoluto es: ${getDataFromDb(playersToFight.winner).twitter.screen_name}, quedando en segundo lugar: ${getDataFromDb(playersToFight.losser).twitter.screen_name}`)
                }, 3000);
            } else if (actualAlivePlayers.length !== 1 && imageCreated) {
                setTimeout(() => {
                    uploadImageTwitter(`El ganador es ${getDataFromDb(playersToFight.winner).twitter.screen_name}, El perdedor es ${getDataFromDb(playersToFight.losser).twitter.screen_name}`)
                }, 3000);
            }
        }
    }, /*60000*/1);
})();