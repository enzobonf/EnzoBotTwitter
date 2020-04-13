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

function search(q, lang, count){

    return new Promise((resolve, reject)=>{

        bot.get('search/tweets', {q, lang, count}, function(err, data, response) {
            
            if(err){
                reject(err);
            }
            else{
                let id, tweet = data.statuses[0];
                if(tweet !== undefined) id = tweet.id_str;

                if(tweet && id && !tweet.retweeted_status && tweetsRetweetados.indexOf(id) === -1){
                    resolve(tweet);
                }
                else{
                    console.log('\nTweet já retweetado, com erro, ou é retweet, daqui a 20 segundos será procurado outro');
                    setTimeout(() => {
                        search(q, lang, count);
                    }, 20000);     
                }
            }

        });

    });

}

function retweet(tweet){

    const id = tweet.id_str;

    bot.post('statuses/retweet/:id', {id}, (err, data, response)=>{
        if(!err){
            tweetsRetweetados.push(id);  
            console.log('\nRetweetado:', tweet.text);
            console.log('Nº de tweets retweetados:', tweetsRetweetados.length);
            console.log('IDs:', tweetsRetweetados);
        }
        else{
            console.error('ERRO retweet:', err.message);
        }
    });

}

function favorite(tweet){

    const id = tweet.id_str;

    bot.post('favorites/create', {id}, (err, response)=>{
        if(!err){
            tweetsFavoritados.push(id);
            console.log('Nº de tweets favoritados:', tweetsFavoritados.length);
            console.log(tweet.text, id);
        }
        else{
            console.log('ERRO fav:', err.message);
        }
    });

}


 setInterval(() => {

    try{
        /*bot.get('search/tweets', { q: '"Enzo"', lang: 'pt', count: 1 }, function(err, data, response) {

            let tweet = data.statuses[0];
        
            if(tweet && tweet.id_str && !tweet.retweeted_status){
                retweet(tweet);
                favorite(tweet);
            }

        });*/

        search('"Enzo"', 'pt', 1).then(tweet=>{

            retweet(tweet);

        }).catch(err=>{
            console.log(err);
        });

    }
    catch(e){
        console.log('ERRO:', e);
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

