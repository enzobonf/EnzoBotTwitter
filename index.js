const twit = require('twit');
const mailer = require('./inc/mailer');
const credentials = require('./credentials.json');

const retweetInterval = 37 * 1000;
const favoriteInterval = 60 * 1000;
const emailsInterval = 1/2; //hora

const bot = new twit(credentials);

/* const stream = bot.stream('statuses/filter', {
    track: 'Enzo',
    tweet_mode: 'extended'
}); */

let tweetsRetweetados = [];
let tweetsFavoritados = [];

let retweetsInTime = 0;

function wordCount(string, word) {

    var length = typeof string === "string" && typeof word === "string" && word.length,
        loop = length,
        index = 0,
        count = 0;

    while (loop) {
        index = string.indexOf(word, index);
        if (index !== -1) {
            count += 1;
            index += length;
        } else {
            loop = false;
        }
    }

    return count;
}

//console.log(wordCount('enzoenzo', 'enzo'));

function search(q, lang, count){

    return new Promise((resolve, reject)=>{

        bot.get('search/tweets', {q, lang, count}, function(err, data, response) {
            
            if(err){
                reject(err);
            }
            else{
                let id, inResponseTo, text, usersMentioned = [], arrayResponse = [];
            
                if(data !== undefined){

                    data.statuses.forEach(tweet=>{
         
                        if(tweet !== undefined) {
    
                            //console.log('\n tweet:', tweet);
                            
                            if(tweet.entities.user_mentions.length > 0){
                                tweet.entities.user_mentions.forEach(user=>{
                                    if(wordCount(user.screen_name.toLowerCase(), 'enzo') >= 1) usersMentioned.push(user.screen_name.toLowerCase());
                                    tweet.text = (tweet.text).replace(`@${user.screen_name}`, '');
                                });
                            }
        
                            id = tweet.id_str;
        
                            /* inResponseTo = tweet.in_reply_to_screen_name;
                            (inResponseTo !== null) ? inResponseTo = inResponseTo.toLowerCase() : '';
         */
                            //(!tweet.truncated) ? text = tweet.text : text = tweet.extended_tweet.full_text;
        
                            text = tweet.text;
                            console.log('------------------------------------\nTweet:', text);
                            text = text.toLowerCase();
        
                            console.log('Quantas vezes Enzo aparece no tweet:', wordCount(text, 'enzo'));
        
                            //console.log(tweet.text.toLowerCase());
                            //console.log(text.indexOf('enzo'));
        
                            if(tweet && id && !tweet.retweeted_status && tweetsRetweetados.indexOf(id) === -1 && text.indexOf('enzo') !== -1
                            && (inResponseTo === null || wordCount(text, 'enzo') >= 1)){
                                arrayResponse.push(tweet);
                            }
                            /* else{
                                resolve(false);
                            } */
        
                        }
    
                    });
    
                    resolve(arrayResponse);
                }
                else{
                    reject('ERRO na pesquisa')
                }

            }

        });

    });

}

function retweet(tweet){

    return new Promise((resolve, reject)=>{

        const id = tweet.id_str;

        bot.post('statuses/retweet/:id', {id}, (err, data, response)=>{
            if(!err){
                tweetsRetweetados.push(id);  
                resolve({text: tweet.text, id});
            }
            else{
                reject(err);
            }
        });

    });
    

}

/* function favorite(tweet){

    return new Promise((resolve, reject)=>{

        const id = tweet.id_str;

        bot.post('favorites/create', {id}, (err, response)=>{
            if(!err){
                tweetsFavoritados.push(id);
                resolve({text: tweet.text, id});
            }
            else{
                reject('ERRO fav:', err.message);
            }
        });

    });

    

} */

/* search('"Enzo"', 'pt', 2).then(tweet=>{
    //if(tweet) retweet(tweet);
}); */

setInterval(() => {

    let num = retweetsInTime;
    retweetsInTime = 0;

    mailer.sendEmail(`${num} retweets em ${emailsInterval} hora`, `${num} tweets foram retweetados pelo bot em ${emailsInterval} hora!`, 'enzobonfx@gmail.com').then(response=>{
        console.log('Email relatório enviado!');
    }).catch(err=>{
        console.log(err);
    });

}, emailsInterval*3600*1000); //envio de emails informativos

setInterval(() => {

    try{

        search('"Enzo"', 'pt', 4).then(tweets=>{

            if(tweets.length > 0){

                tweets.forEach(tweet=>{
                    retweet(tweet).then(response=>{

                        console.log('\nNº de tweets retweetados:', tweetsRetweetados.length);
                        console.log('Retweetado:', response.text);

                        retweetsInTime++;
        
                    }).catch(err=>{
                        console.log('ERRO retweet:', err.message);
                    });
                });

            }
            else{
                console.log('\nNão foi encontrado nenhum tweet válido.');
            }
            
        }).catch(err=>{
            console.log(err);
        });

    }
    catch(e){
        console.log('ERRO no setInterval()', e);
    }

}, retweetInterval);

/* setInterval(() => {
    bot.get('search/tweets', { q: 'Enzo', count: 1 }, function(err, data, response) {

        let tweet = data.statuses[0];

        favorite(tweet);
    
    });
}, 42000); */


/*stream.on('tweet', (tweet)=>{
    try{

        setInterval(() => {

            try{
                
                let id = tweet.id_str;
                console.log(tweet);
        
                retweet(tweet);
                favorite(tweet); 
            }
            catch(e){
                console.error('ERRO:', e);
            }
            
        
        }, 1000);


    }
    catch(e){
        console.log('Erro na streaming API:', e);
    }
});*/

