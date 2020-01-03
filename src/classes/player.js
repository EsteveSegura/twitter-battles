class Player {
    constructor(userTwitter, alive, chanceToStayAlive,luck){
        this.twitter = userTwitter,
        this.alive = alive,
        this.chanceToStayAlive =chanceToStayAlive
        this.luck = luck
    }

    stayAliveVsEnemy(enemy){
        if(enemy.chanceToStayAlive > this.chanceToStayAlive){
            //lose
        }else{
            //win
        }
    }

    getHealth(){
        return this.health
    }
}

module.exports =  Player ;