let twit = require('twit');
let credentials = require('./credentials.json');

const retweetInterval = 60 * 1000;
const favoriteInterval = 60 * 1000;

const bot = new twit(credentials);

/* const stream = bot.stream('statuses/filter', {
    track: 'Enzo',
    tweet_mode: 'extended'
}); */

let tweetsRetweetados = 0;
let tweetsFavoritados = 0;


function retweet(tweet){

    const id = tweet.id_str;

    bot.post('statuses/retweet/:id', {id}, (err, data, response)=>{
        if(!err){
            tweetsRetweetados++;      
            console.log('Nº de tweets retweetados', tweetsRetweetados);
        }
        else{
            console.error('ERRO retweet:', err.message);
        }
    });

}

function favorite(tweet){
    try{
        const id = tweet.id_str;

        bot.post('favorites/create', {id}, (err, response)=>{
            if(!err){
                tweetsFavoritados++;
                console.log('Nº de tweets favoritados:', tweetsFavoritados);
                console.log(tweet.text, id);
            }
            else{
                console.log('ERRO fav:', err.message);
            }
        });
    }
    catch(e){
        console.error('ERRO:', e);
    }

}


 setInterval(() => {

    try{
        bot.get('search/tweets', { q: '"Enzo"', lang: 'pt', count: 1 }, function(err, data, response) {

            let tweet = data.statuses[0];
        
            if(tweet && tweet.id_str && !tweet.retweeted_status){
                retweet(tweet);
                favorite(tweet);
            }

        });

    }
    catch(e){
        console.log('ERRO:', e);
    }
    

}, 45000);

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

