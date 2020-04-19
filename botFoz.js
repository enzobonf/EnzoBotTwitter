const twit = require('twit');
const credentials = require('./credentials.json');
const mailer = require('./inc/mailer');
const retweet = require('./inc/retweet');

const retweetInterval = 60 * 1000;

let retweetsInTime = 0;
let emailsInterval = 1; //hora

const bot = new twit(credentials.FozBot);

let tweetsRetweetados = [];

this.isRunning = false;

function initCountRetweets(){

    this.countRetweetsInterval = setInterval(() => {

        let num = retweetsInTime;
        retweetsInTime = 0;

        mailer.sendEmail(`FozBot - ${num} retweets em ${emailsInterval} hora`, `${num} tweets foram retweetados pelo bot em ${emailsInterval} hora!`, 'FozBot', 'enzobonfx@gmail.com').then(response=>{
            console.log('Email relatório enviado!');
        }).catch(err=>{
            console.log(err);
        });

    }, emailsInterval*3600*1000); //envio de emails informativos

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

                retweet(bot, tweet).then(response=>{

                    tweetsRetweetados.push(response.id);
                    console.log('-------------------BOT FOZ-----------------------\nNº de tweets retweetados:', tweetsRetweetados.length);
                    console.log('Retweetado:', response.text);
                    console.log('--------------------------------------------------');

                    retweetsInTime++;

                }).catch(err=>{

                    let stringError = err.message;
                    switch(err.code){
                        case 88:
                            mailer.sendEmail('EnzoBot - Limite atingido!', '', 'EnzoBot', 'enzobonfx@gmail.com').then(response=>{
                                console.log('Email sobre limite atingido foi enviado');
                            }).catch(err=>{
                                console.log(err);
                            });
                        case 136:
                            stringError += ` ---> @${tweet.user.screen_name}`;
                    }

                    console.log('FozBot - Erro retweet:', stringError);

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