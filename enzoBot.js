const twit = require('twit');
//const credentials = require('./inc/twitterCredentials.json');
const twitter = require('./inc/twitter');

const retweetInterval = 60 * 1000;

const bot = new twit({
    consumer_key: process.env.ENZO_CONSUMER_KEY,
    consumer_secret: process.env.ENZO_CONSUMER_SECRET_KEY,
    access_token: process.env.ENZO_ACCESS_TOKEN,
    access_token_secret: process.env.ENZO_ACCESS_SECRET_TOKEN
});

let retweetsInTime = 0;
let messagesInterval = 2; //hora

let tweetsRetweetados = [];

this.isRunning = false;

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
                            
                            if(tweet.entities.user_mentions.length > 0){
                                tweet.entities.user_mentions.forEach(user=>{
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
        
                            if(tweet && id && !tweet.retweeted_status && tweetsRetweetados.indexOf(id) === -1 && wordCount(text, 'enzo') >= 1){
                                arrayResponse.push(tweet);
                            }
        
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

    this.countRetweetsInterval = setInterval(() => {

        let num = retweetsInTime;
        retweetsInTime = 0;

        twitter.reportViaDm(bot, num, messagesInterval).then(response=>{
            console.log('Mensagem relatório enviada com sucesso!');
        }).catch(err=>{
            console.log(err);
        });

    }, messagesInterval*3600*1000); //envio de mensagens (via DM) informativas

}

function searchAndRetweet(q, lang, count){

    try{

        search(q, lang, count).then(tweets=>{

            if(tweets.length > 0){

                tweets.forEach(tweet=>{

                    twitter.verifyIfUserBlocked('EnzoBot', tweet.user.id_str).then(blocked=>{

                        if(!blocked){
                            
                            twitter.retweet(bot, tweet, 'EnzoBot').then(response=>{

                                tweetsRetweetados.push(response.id);
                                console.log('-------------------BOT ENZO-----------------------\nNº de tweets retweetados:', tweetsRetweetados.length);
                                console.log('Retweetado:', response.text);
                                console.log('--------------------------------------------------')
        
                                retweetsInTime++;
                
                            }).catch(err=>{
        
                                console.log(err);
                                
                            });

                        }
                        else{
                            console.log(`EnzoBot - Autor (@${tweet.user.screen_name}) bloqueou o bot, tweet descartado`)
                        }

                    }).catch(err=>{
                        console.log(err);
                    });;           

                });

            }
            else{
                console.log('\nEnzoBot - Nenhum tweet válido encontrado');
            }
            
        }).catch(err=>{
            console.log(err);
        });

    }
    catch(e){
        console.log('ERRO no setInterval()', e);
    }
}

module.exports =  {

    startBot(q, lang, count){
        
        if(!this.isRunning){

            console.log('EnzoBot iniciou');

            this.enzoBotInterval = setInterval(() => {
                searchAndRetweet(q, lang, count);
            }, retweetInterval);

            initCountRetweets();

            this.isRunning = true;

        }
        else{
            console.log('O bot já está em execução!');
        }

    },

    stopBot(){
        if(this.isRunning){
            clearInterval(this.enzoBotInterval);
            clearInterval(this.countRetweetsInterval);
            this.isRunning = false;
            retweetsInTime = 0;
            console.log('EnzoBot parou');
        }
        else{
            console.log('O bot não está em execução!');
        }
        
    }

}

