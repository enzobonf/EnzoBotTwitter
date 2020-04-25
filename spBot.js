const twit = require('twit');
const credentials = require('./inc/twitterCredentials.json');
const twitter = require('./inc/twitter');

const retweetInterval =  60 * 1000;

let retweetsInTime = 0;
let messagesInterval = 1; //hora

const bot = new twit(credentials.SPBot);

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

function searchSP(radius, count){

    return new Promise((resolve, reject)=>{

        bot.get('search/tweets', {q: '', lang: 'pt', count, geocode: `-23.569097,-46.593397,${radius}`, result_type: 'recent'}, function(err, data, response) {

            if(err){
                reject(err);
            }
            else{

                let arrayResponse = [];

                if(data.statuses !== undefined){

                    data.statuses.forEach(tweet=>{

                        if(tweet !== undefined && (!tweet.retweeted_status || tweet.retweeted_status.is_quote_status) && tweet.in_reply_to_status_id === null && tweetsRetweetados.indexOf(tweet.id_str) === -1){
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
    searchSP(radius, count).then(tweets=>{

        if(tweets.length > 0){

            tweets.forEach(tweet=>{             

                //verificar se usuário bloqueou o bot
                twitter.verifyIfUserBlocked('SPBot', tweet.user.id_str).then(blocked=>{

                    if(!blocked){

                        twitter.retweet(bot, tweet, 'SPBot').then(response=>{

                            tweetsRetweetados.push(response.id);
                            console.log('-------------------BOT SP-----------------------\nNº de tweets retweetados:', tweetsRetweetados.length);
                            console.log('Retweetado:', response.text);
                            console.log('--------------------------------------------------');
        
                            retweetsInTime++;
        
                        }).catch(err=>{
        
                            console.log(err);
        
                        });

                    }
                    else{
                        console.log(`SPBot - Autor (@${tweet.user.screen_name}) bloqueou o bot, tweet descartado`)
                    }
                
                }).catch(err=>{
                    console.log(err);
                });


            });

            
        }
        else{
            console.log('\nSPBot - Nenhum tweet válido encontrado');
        }

    });
}

module.exports = {

    startBot(radius, count){

        if(!this.isRunning){

            console.log('SPBot iniciou');

            this.SPBotInterval = setInterval(() => {
            
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
            clearInterval(this.SPBotInterval);
            clearInterval(this.countRetweetsInterval);
            this.isRunning = false;
            retweetsInTime = 0;
            console.log('SPBot parou');
        }
        else{
            console.log('O bot não está em execução!');
        }

    }

};