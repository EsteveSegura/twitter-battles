const utils = require('../utils/utils');

/*  ToDo:
    [ ]Check if we want to use "Normalized" data
*/


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
        this.tempRatioToWin = this.ratioToWin
        return actualBonusPreKills;
    }

    getStrength(ValueToNormalize){
        let actualStrength = this.strength ;
        this.ratioToWin = actualStrength;
        return actualStrength;
    }

    getInjured(dmgFromEnemy,ValueToNormalize){
        this.defineRandomDefense();
        let actualDamageRecived =  dmgFromEnemy - this.defense
        if(actualDamageRecived < 0){
            actualDamageRecived = 0
        }
        this.ratioToWin = Math.abs(this.ratioToWin - actualDamageRecived);
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