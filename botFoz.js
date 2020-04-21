const twit = require('twit');
const credentials = require('./inc/twitterCredentials.json');
const mailer = require('./inc/mailer');
const twitter = require('./inc/twitter');

const retweetInterval = 60 * 1000;

let retweetsInTime = 0;
let messagesInterval = 1; //hora

const bot = new twit(credentials.FozBot);

let tweetsRetweetados = [];

this.isRunning = false;

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

function searchFoz(radius, count){

    return new Promise((resolve, reject)=>{

        bot.get('search/tweets', {q: '', lang: 'pt', count, geocode: `-25.539969,-54.581849,${radius}`}, function(err, data, response) {

            if(err){
                reject(err);
            }
            else{

                let arrayResponse = [];

                if(data.statuses !== undefined){

                    data.statuses.forEach(tweet=>{

                        if(tweet !== undefined && !tweet.retweeted_status && tweet.in_reply_to_status_id === null && tweetsRetweetados.indexOf(tweet.id_str) === -1){
                            arrayResponse.push(tweet);
                        }
    
                    });
    
                    resolve(arrayResponse);
    
                }
                else{
                    reject('Erro nos tweeets pesquisados');
                }
                

            }

        });
    });
    
}

function searchAndRetweet(radius, count){
    searchFoz(radius, count).then(tweets=>{

        if(tweets.length > 0){

            tweets.forEach(tweet=>{

                //verificar se usuário bloqueou o bot
                twitter.verifyIfUserBlocked('FozBot', tweet.user.id_str).then(blocked=>{

                    if(!blocked){

                        twitter.retweet(bot, tweet, 'FozBot').then(response=>{

                            tweetsRetweetados.push(response.id);
                            console.log('-------------------BOT FOZ-----------------------\nNº de tweets retweetados:', tweetsRetweetados.length);
                            console.log('Retweetado:', response.text);
                            console.log('--------------------------------------------------');
        
                            retweetsInTime++;
        
                        }).catch(err=>{
        
                            console.log(err);
        
                        });

                    }
                    else{
                        console.log(`FozBot - Autor (@${tweet.user.screen_name}) bloqueou o bot, tweet descartado`)
                    }
                
                }).catch(err=>{
                    console.log(err);
                });


            });
            
        }
        else{
            console.log('\nFozBot - Nenhum tweet válido encontrado');
        }

    });
}

module.exports = {

    startBot(radius, count){

        if(!this.isRunning){

            console.log('FozBot iniciou');

            this.fozBotInterval = setInterval(() => {
            
                searchAndRetweet(radius, count);

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
            clearInterval(this.fozBotInterval);
            clearInterval(this.countRetweetsInterval);
            this.isRunning = false;
            retweetsInTime = 0;
            console.log('FozBot parou');
        }
        else{
            console.log('O bot não está em execução!');
        }

    }

};