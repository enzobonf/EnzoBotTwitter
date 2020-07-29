const twit = require('twit');
const twitter = require('./inc/twitter');

const jimp = require('jimp');

require('dotenv').config();

const bot = new twit({
    consumer_key: process.env.PIXELIZE_CONSUMER_KEY,
    consumer_secret: process.env.PIXELIZE_CONSUMER_SECRET_KEY,
    access_token: process.env.PIXELIZE_ACCESS_TOKEN,
    access_token_secret: process.env.PIXELIZE_ACCESS_SECRET_TOKEN
});

function startPixelizer(){

    console.log('bot pixelizador iniciou');

    let stream = bot.stream('statuses/filter', { track: '@pixelizarbot' });

    stream.on('tweet', async tweet=>{

        if(tweet.text.indexOf('@pixelizarbot') !== -1 && tweet.in_reply_to_screen_name !== 'pixelizarbot'){

            console.log(tweet);

            let replyToId = tweet.in_reply_to_status_id_str;

            let tweetId = tweet.id_str;
            let user = tweet.user.screen_name;

            getImgUris(replyToId).then(uris=>{

                console.log(uris);

                if(uris.length === 0) return false;

                let b64Array = [], promises = [], mediaIds = [];

                uris.forEach(uri=>{
                    
                    let promise = pixelize(uri).then(async pixelizedImg=>{
                
                        let b64 = pixelizedImg.toString('base64');
                        mediaIds.push(await twitter.uploadMedia(bot, b64));
                        Promise.resolve();

                    });

                    promises.push(promise);

                });

                Promise.all(promises).then(()=>{

                    twitter.tweet(bot, `@${user}`, params = {
                        in_reply_to_status_id: tweetId,
                        media_ids: mediaIds
                    }).then(response=>{
        
                        console.log('resposta enviada!');
                    
                    }).catch(err=>{
                        console.log(err);
                    });

                });

            });


        }
        

    });
}

function getImgUris(tweetId){

    return new Promise((resolve, reject)=>{

        bot.get('statuses/show', { id: tweetId}, function(err, data, response) {

            if(!err){

                let arrayUris = [];
                if(!data.extended_entities) return resolve(arrayUris);

                let medias = data.extended_entities.media;

                medias.forEach(media=>{
                    if(media.type === 'photo'){
                        arrayUris.push(media.media_url);
                    }
                });

                resolve(arrayUris);

            }
            else{
                reject(err);
            }
    
    
        });

    });
    

}

function pixelize(imgUrl){

    return new Promise((resolve, reject)=>{

        jimp.read(imgUrl).then(img=>{
            return resolve(img.pixelate(20).getBufferAsync(jimp.AUTO));
        }).catch(err=>{
            reject(err);
        });

    });

}

//codigo para teste:
/* getImgUris('1287390917272506368').then(uris=>{

    console.log(uris);

    if(uris.length === 0) return false;

    let b64Array = [], promises = [], mediaIds = [];

    uris.forEach(uri=>{
        
        let promise = pixelize(uri).then(pixelizedImg=>{
    
            let b64 = pixelizedImg.toString('base64');
            b64Array.push(b64);

        });

        promises.push(promise);

    });

    Promise.all(promises).then(()=>{
        
        promises = [];

        b64Array.forEach(b64=>{

            let promise = twitter.uploadMedia(bot, b64).then(mediaId=>{

                mediaIds.push(mediaId);

            });

            promises.push(promise);

        });

        Promise.all(promises).then(()=>{

            twitter.tweet(bot, `@enzobonf`, params = {
                in_reply_to_status_id: '1287481880372183047',
                media_ids: mediaIds
            }).then(response=>{

                console.log('resposta enviada!');
            
            });

        });

    });


}); */

module.exports = {
    start: startPixelizer
}
