const twit = require('twit');
const credentials = require('./credentials.json');
const mailer = require('./inc/mailer');
const retweet = require('./inc/retweet');

const retweetInterval = 60 * 1000;

let retweetsInTime = 0;
let emailsInterval = 1; //hora

const bot = new twit(credentials.FozBot);

let tweetsRetweetados = [];

function initCountRetweets(){

    setInterval(() => {

        let num = retweetsInTime;
        retweetsInTime = 0;

        mailer.sendEmail(`FozBot - ${num} retweets em ${emailsInterval} hora`, `${num} tweets foram retweetados pelo bot em ${emailsInterval} hora!`, 'enzobonfx@gmail.com').then(response=>{
            console.log('Email relatório enviado!');
        }).catch(err=>{
            console.log(err);
        });

    }, emailsInterval*3600*1000); //envio de emails informativos

}

function searchFoz(radius, count){

    return new Promise((resolve, reject)=>{

        bot.get('search/tweets', {q: '', lang: 'pt', count, geocode: '-25.539969,-54.581849,20km'}, function(err, data, response) {

            if(err){
                reject(err);
            }
            else{

                let arrayResponse = [];

                if(data.statuses !== undefined){

                    data.statuses.forEach(tweet=>{

                        if(!tweet.retweeted_status && tweet.in_reply_to_status_id === null){
                            arrayResponse.push(tweet);
                        }
    
                    });
    
                    resolve(arrayResponse);
    
                }

            }

        });
    });
    
}

module.exports = (radius, count) => {

    setInterval(() => {
        
        searchFoz(radius, count).then(tweets=>{

            if(tweets.length > 0){

                tweets.forEach(tweet=>{

                    retweet(bot, tweet).then(response=>{
    
                        tweetsRetweetados.push(response.id);
                        console.log('-------------------BOT FOZ-----------------------\nNº de tweets retweetados:', tweetsRetweetados.length);
                        console.log('Retweetado:', response.text);
                        console.log('--------------------------------------------------');

                        retweetsInTime++;
    
                    }).catch(err=>{
                        console.log('ERRO retweet:', err.message);
                    });;

                });
                
            }

        });

    }, retweetInterval);

    initCountRetweets();

};