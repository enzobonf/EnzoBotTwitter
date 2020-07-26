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

    let stream = bot.stream('statuses/filter', { track: '@pixelizarbot' });

    stream.on('tweet', async tweet=>{

        if(tweet.text.indexOf('@pixelizarbot') !== -1 && tweet.in_reply_to_screen_name !== 'pixelizarbot'){

            console.log(tweet);

            let replyToId = tweet.in_reply_to_status_id_str;
            console.log(replyToId);

            let tweetId = tweet.id_str;
            let user = tweet.user.screen_name;

            getImgUris(replyToId).then(uri=>{

                console.log(uri);

                if(uri === '') return false;
                
                pixelize(uri).then(pixelizedImg=>{

                    let b64 = pixelizedImg.toString('base64');

                    twitter.uploadMedia(bot, b64).then(mediaIds=>{

                        console.log(mediaIds);
                        twitter.tweet(bot, `@${user}`, params = {
                            in_reply_to_status_id: tweetId,
                            media_ids: mediaIds
                        }).then(response=>{
            
                            console.log('resposta enviada!');
                        
                        });
            
                    });

                });

            });

        }
        

    });
}

/* twitter.tweet(bot, '@enzobonf', params = {in_reply_to_status_id: '1287196538264080384'}).then(response=>{

    console.log('resposta enviada!');

}); */

/* bot.get('statuses/show', { id: '1285674693450752003'}, function(err, data, response) {

    let imgURI = data.entities.media[0].media_url;
    pixelize(imgURI).then(pixelatedImg=>{

        let b64 = pixelatedImg.toString('base64');
        twitter.uploadMedia(bot, b64).then(mediaId=>{
            console.log(mediaId);
        });

    });

});  */

/* getImgUris().then(uri=>{

    console.log(uri);

    if(uri === '') return false;
        
    pixelize(uri).then(pixelizedImg=>{

        let b64 = pixelizedImg.toString('base64');

        twitter.uploadMedia(bot, b64).then(mediaIds=>{

            console.log(mediaIds);
            twitter.tweet(bot, `@enzobonf`, params = {
                in_reply_to_status_id: '1287196538264080400',
                media_ids: mediaIds
            }).then(response=>{

                console.log('resposta enviada!');
            
            });

        });

    });

}); */

function getImgUris(tweetId = '1285674693450752003'){

    return new Promise((resolve, reject)=>{

        bot.get('statuses/show', { id: tweetId}, function(err, data, response) {

            if(!err){

                console.log(data.entities.media);

                if(!data.entities.media) return resolve('');

                let medias = data.entities.media;
                let arrayUris = [];

                medias.forEach(media=>{
                    if(media.type === 'photo'){
                        return resolve(media.media_url);
                    }
                    return resolve('');
                });

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
            return resolve(img.pixelate(25).getBufferAsync(jimp.AUTO));
        }).catch(err=>{
            reject(err);
        });

    });

}

module.exports = {
    start: startPixelizer
}
