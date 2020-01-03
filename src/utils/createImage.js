const jimp = require('jimp')
const download = require('image-downloader')
const path = require('path');
const fs = require('fs');


//config
const defaultErrorAvatarPicture = 'https://ktva.images.worldnow.com/images/16098319_G.png'

let datos = []

function convertPhotoUrlTo400x400(url){
    if(url != null){
        if(!url.includes("400x400")){
            return url.replace("_normal", "_400x400");
        }else{
            return url
        }
    }else{
        return defaultErrorAvatarPicture
    }
}

async function createImage(imgWinner,imgLosser,userTwitterWinner,userTwitterLosser,cb){
    if(imgWinner == null){
        imgWinner = './assets/placeholder.png'
    }
    if(imgLosser == null){
        imgLosser = './assets/placeholder.png'
    }
    let img = ['./assets/background.png','./assets/lose.png',imgWinner,imgLosser];
    let jimps = [];

    for(let i = 0 ; i < img.length;i++){
        jimps.push(jimp.read(img[i]))
    }

    Promise.all(jimps).then(async function(data){
        return Promise.all(jimps);
    }).then(async function(data){
        await jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function (font) {
            //Winner
            data[0].print(font, 198, 600, {
                text: userTwitterWinner,
                alignmentX: jimp.HORIZONTAL_ALIGN_CENTER
            }, 400, 400);

            //Losser
            data[0].print(font, 990, 600, {
                text: userTwitterLosser,
                alignmentX: jimp.HORIZONTAL_ALIGN_CENTER
            }, 400, 400);
        })
        
        await data[2].resize(400, 400)
        await data[3].resize(400, 400)
        
        await data[0].composite(data[2],198,198)//Winer
        await data[0].composite(data[3].greyscale(), 990,198)//Loser
        await data[0].composite(data[1],1,1)//X de losser

        await data[0].write('./upload.png', function(){
            cb()
        })
    });
}

async function downloadIMG(urlImg,pushToArray){
    const options = {
        url: urlImg,
        dest: './assets/'                  
    }

    try {
        let dataFile = {}
        let { filename, image } = await download.image(options)
        dataFile = {
            filepath: filename
        }
        //console.log(dataFile)
        pushToArray.push(dataFile)

    } catch (e) {
        console.error(e)
    }
}

async function ProcessAll(urlImageWinner,urlImageLosser,userTwitterWinner,userTwitterLosser,cb){
    await downloadIMG(convertPhotoUrlTo400x400(urlImageWinner),datos)
    await downloadIMG(convertPhotoUrlTo400x400(urlImageLosser),datos)
    console.log(datos)
    await createImage(datos[0].filepath,datos[1].filepath,userTwitterWinner,userTwitterLosser,function(){
        deleteAllDownloadedImages('./uploads')
    })
    datos = []
    cb();
}

function deleteAllDownloadedImages(directory){
    fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
        });
    }
    });
}



module.exports = { ProcessAll, defaultErrorAvatarPicture };