let twit = require('twit');
let credentials = require('./credentials.json');

const retweetInterval = 60 * 1000;
const favoriteInterval = 60 * 1000;

const bot = new twit(credentials);

/* const stream = bot.stream('statuses/filter', {
    track: 'Enzo',
    tweet_mode: 'extended'
}); */

let tweetsRetweetados = [];
let tweetsFavoritados = [];

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
                let id, tweet = data.statuses[0], inResponseTo, text;

                if(tweet !== undefined) {

                    console.log('\n tweet:', tweet.text);

                    id = tweet.id_str;

                    inResponseTo = tweet.in_reply_to_screen_name;
                    (inResponseTo !== null) ? inResponseTo = inResponseTo.toLowerCase() : '';

                    //(!tweet.truncated) ? text = tweet.text : text = tweet.extended_tweet.full_text;
                    text = tweet.text;
                    text = text.toLowerCase();

                    console.log('Quantas vezes Enzo aparece no tweet:', wordCount(text, 'enzo'));

                    console.log(inResponseTo);

                    //console.log(tweet.text.toLowerCase());
                    console.log(text.indexOf('enzo'));


                    if(tweet && id && !tweet.retweeted_status && tweetsRetweetados.indexOf(id) === -1 && text.indexOf('enzo') !== -1
                    && (inResponseTo === null || wordCount(text.replace(inResponseTo), 'enzo') >= 1)){
                        resolve(tweet);
                    }
                    else{
                        console.log('\nTweet não contém "Enzo", já retweetado, com erro, ou é retweet, daqui a 20 segundos será procurado outro');
                        setTimeout(() => {
                            search(q, lang, count);
                        }, 40000);     
                    }

                }
                else{
                    reject('ERRO');
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
                reject('ERRO retweet:', err.message);
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


 setInterval(() => {

    try{

        search('"Enzo"', 'pt', 1).then(tweet=>{

            retweet(tweet).then(response=>{

                console.log('Nº de tweets retweetados:', tweetsRetweetados.length);
                console.log('Retweetado:', response.text);

            }).catch(err=>{
                console.log(err);
            });

        }).catch(err=>{
            console.log(err);
        });

    }
    catch(e){
        console.log('ERRO no setInterval()', e);
    }

}, 40000);

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

