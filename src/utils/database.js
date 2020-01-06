const fs = require('fs');

function saveDB(arr){
    return new Promise ((resolve,reject) => {
        fs.writeFile('./db/players.json', JSON.stringify(arr) , (err) =>{
            if (err) throw err ;
            console.log("DB SAVED.");
            resolve(true);
        });
    });
}

function readDB(){
    return new Promise((resolve,reject) => {
        fs.readFile('./db/players.json', (err,data) =>{
            if(err) reject(err);
            resolve(JSON.parse(data));
        });
    });
}


module.exports = { saveDB, readDB }