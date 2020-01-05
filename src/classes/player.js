const utils = require('../utils/utils');

class Player {
    constructor(userTwitter, alive, luck, strength, kills, name, defenseRange){
        this.twitter = userTwitter,
        this.alive = alive,
        this.luck = luck,
        this.strength = strength,
        this.kills = kills,
        this.name = name,
        this.defenseRange = defenseRange,
        this.defense = 1,
        this.ratioToWin = 1,
        this.tempRatioToWin = 1
    }

    defineRandomDefense(){
        let defenseActual = utils.getRandomIntBeetweenNumbers(this.defenseRange[0],this.defenseRange[1]);
        this.defense = defenseActual;
        return defenseActual;
    }

    getBonusPerKill(bonus){
        let actualBonusPreKills = this.kills * bonus
        this.ratioToWin += actualBonusPreKills;
        return actualBonusPreKills;
    }

    getStrength(ValueToNormalize){
        let actualStrength = this.strength / ValueToNormalize;
        this.ratioToWin = actualStrength;
        return actualStrength;
    }

    getInjured(dmgFromEnemy,ValueToNormalize){
        console.log("DMGCOOMING" + dmgFromEnemy)
        this.tempRatioToWin = this.ratioToWin
        this.defineRandomDefense();
        let actualDamageRecived =  dmgFromEnemy - (this.defense / ValueToNormalize) 
        console.log(`actual recived DMG ${this.name} : ${actualDamageRecived}`)
        console.log(dmgFromEnemy +"dmgenemy")
        console.log(this.defense +"defnese")
        console.log(ValueToNormalize +"normalizas")

        /*if(actualDamageRecived < 0){
            actualDamageRecived = 0
        }*/
        this.ratioToWin = this.ratioToWin - actualDamageRecived;
        return actualDamageRecived;
    }

    getLucky(){
        let randomLuck = utils.getRandomIntBeetweenNumbers(0,100);
        if(this.luck >= randomLuck){
            return true;
        }else{
            return false;
        }
    }

    //aplico mi fuerza**
    //aplico la ventaja que me da matar a x personas**
    //aplico la defensa a todo el actual ratio to win
    //SUERTE
}

module.exports =  Player ;