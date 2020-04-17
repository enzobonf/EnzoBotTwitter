const twit = require('twit');
const credentials = require('./credentials.json');
const mailer = require('./inc/mailer');
const retweet = require('./inc/retweet');

const retweetInterval = 50 * 1000;

const bot = new twit(credentials.EnzoBot);

let retweetsInTime = 0;
let emailsInterval = 1; //hora

let tweetsRetweetados = [];

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
            
                if(data.statuses !== undefined){

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
                            text = text.toLowerCase();
        
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

function initCountRetweets(){

    setInterval(() => {

        let num = retweetsInTime;
        retweetsInTime = 0;

        mailer.sendEmail(`EnzoBot - ${num} retweets em ${emailsInterval} hora`, `${num} tweets foram retweetados pelo bot em ${emailsInterval} hora!`, 'enzobonfx@gmail.com').then(response=>{
            console.log('Email relatório enviado!');
        }).catch(err=>{
            console.log(err);
        });

    }, emailsInterval*3600*1000); //envio de emails informativos

}

module.exports = (q, lang, count) => {

    setInterval(() => {

        try{

            search(q, lang, count).then(tweets=>{
    
                if(tweets.length > 0){
    
                    tweets.forEach(tweet=>{
                        
                        retweet(bot, tweet).then(response=>{
    
                            tweetsRetweetados.push(response.id);
                            console.log('-------------------BOT ENZO-----------------------\nNº de tweets retweetados:', tweetsRetweetados.length);
                            console.log('Retweetado:', response.text);
                            console.log('--------------------------------------------------')
    
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

    initCountRetweets();

}

