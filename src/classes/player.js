const utils = require('../utils/utils');

class Player {
    constructor(userTwitter, alive, luck, strength, kills, name, defense){
        this.twitter = userTwitter,
        this.alive = alive,
        this.luck = luck,
        this.strength = strength,
        this.kills = kills,
        this.name = name,
        this.defense = defense
    }

    getRandomDefense(){
        return utils.getRandomIntBeetweenNumbers(this.defense[0],this.defense[1])
    }
   
}

module.exports =  Player ;