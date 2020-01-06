require('dotenv').config();
const fs = require('fs');
const Twit = require('twit');

const dataBase = require('./utils/database')
const utils = require('./utils/utils');
const Player = require('./classes/player');
const createImage = require('./utils/createImage');
const timeManager = require('./utils/timeManager');

const valueToNormalize = 100;
const bonusPerKill = 1

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
        let db = await dataBase.readDB()
        let finalArray = await Promise.all(db.players.map(async (player) => {
            let dataFromTwitter = await getUserTwitter(player.name);
            let actualPlayer = new Player(dataFromTwitter, player.alive, player.luck, player.strength, player.kills, player.name, player.defenseRange);
            return actualPlayer;
        }));
        return finalArray;
    } catch (error) {
        console.log(error);
    }
}

function getAlivePlayers(arr) {
    let alive = arr.filter((player) => {
        if (player.alive) {
            return player;
        }
    });
    return alive;
}

async function battle(fulldb) {
    let winner = null;
    let losser = null
    let playersSelectedToFight = []
    let playersAlive = getAlivePlayers(fulldb);


    let playerIndexOne = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)
    let playerIndexTwo = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)

    while (playerIndexOne === playerIndexTwo) {
        playerIndexOne = utils.getRandomIntBeetweenNumbers(0, playersAlive.length - 1)
    }

    playersSelectedToFight.push(playersAlive[playerIndexOne])
    playersSelectedToFight.push(playersAlive[playerIndexTwo])

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

    playersSelectedToFight[0].getInjured(playersSelectedToFight[1].tempRatioToWin, valueToNormalize)
    playersSelectedToFight[1].getInjured(playersSelectedToFight[0].tempRatioToWin, valueToNormalize)

    console.log('--- Ratio fuerza + kills - (daño - (defensa /100))  ---');
    console.log(playersSelectedToFight[0].ratioToWin + " Jugador:" + playersSelectedToFight[0].twitter.screen_name)
    console.log(playersSelectedToFight[1].ratioToWin + " Jugador:" + playersSelectedToFight[1].twitter.screen_name)
    console.log('------');

    if (playersSelectedToFight[0].ratioToWin >= playersSelectedToFight[1].ratioToWin) {
        let losserLuck = playersSelectedToFight[1].getLucky()
        console.log(`Ha ganado ${playersSelectedToFight[0].twitter.screen_name}`)
        winner = playersSelectedToFight[0]
        losser = playersSelectedToFight[1]
        if (losserLuck) {
            console.log(`Pero la suerte de ${playersSelectedToFight[1].twitter.screen_name} es: ${playersSelectedToFight[1].luck} y eso de le ha convertido en ganador`)
            winner = playersSelectedToFight[1]
            losser = playersSelectedToFight[0]
        }
    } else {
        let losserLuck = playersSelectedToFight[0].getLucky()
        console.log(`Ha ganado ${playersSelectedToFight[1].twitter.screen_name}`)
        winner = playersSelectedToFight[1]
        losser = playersSelectedToFight[0]
        if (losserLuck) {
            console.log(`Pero la suerte de ${playersSelectedToFight[0].twitter.screen_name} es: ${playersSelectedToFight[0].luck} y eso de le ha convertido en ganador`)
            winner = playersSelectedToFight[0]
            losser = playersSelectedToFight[1]
        }
    }

    let dbToSave = setActualDataBase(winner, losser, fulldb)
    await dataBase.saveDB(dbToSave)

    console.log(`El ganador es ${winner.twitter.screen_name}`)
    console.log(`El perdedor es ${losser.twitter.screen_name}`)

    return {
        "winner": winner,
        "losser": losser
    }
}

function setActualDataBase(win, loss, db) {
    let dbToSave = db.map((player) => {
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
                    createImage.deleteAllDownloadedImages('./uploads/')
                    console.log("Image Uploaded!")
                })
            }
        })
    })
}


(async () => {
    setInterval(async () => {

        let now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let canIDoTheActions = timeManager.checkIfWeAreInTime(hour, minute);

        console.log(`son las ${hour}:${minute}. Mi permiso para hacer la acción es: ${canIDoTheActions}`);
        if (canIDoTheActions) {
            let actualPlayers = await populateActualPlayers();
            let actualAlivePlayers = getAlivePlayers(actualPlayers)
            let playersToFight = await battle(actualPlayers)
            let imageCreated = await createImage.ProcessAll(playersToFight.winner, playersToFight.losser)
            if (actualAlivePlayers.length == 2 && imageCreated) {
                setTimeout(() => {uploadImageTwitter(`El ganador absoluto es: ${playersToFight.winner.twitter.screen_name}, quedando en segundo lugar: ${playersToFight.losser.twitter.screen_name}`)}, 3000);
            } else if (actualAlivePlayers.length !== 2 && imageCreated) {
                setTimeout(() => {uploadImageTwitter(`El ganador es ${playersToFight.winner.twitter.screen_name}, El perdedor es ${playersToFight.losser.twitter.screen_name}`)}, 3000);
            }
        }
    }, 60000 * 1);
})();
