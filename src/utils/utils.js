const fs = require('fs');

function getRandomIntBeetweenNumbers(min,max){
    return Math.floor(Math.random() * (max - min +1) + min)
}

function normalizeData(val, min, max){
    let valFixed = val.toFixed(2)
    let maxMin = max-min
    return ((Number.parseFloat(valFixed) - parseInt(min) )/ maxMin );
}

function saveDB(arr){
    fs.writeFile('./db/players.json', JSON.stringify(arr) , (err) =>{
        if (err) throw err ;
        console.log("DB SAVED.")
    })
}




module.exports = {getRandomIntBeetweenNumbers, normalizeData, saveDB }