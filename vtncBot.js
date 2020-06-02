const twit = require('twit');
const credentials = require('./inc/twitterCredentials.json');
const twitter = require('./inc/twitter');

const xingamentosInterval =  120 * 1000;

let xingamentosInTime = 0;
let messagesInterval = 1; //hora

const bot = new twit(credentials.vtncBot);

let usersXingados = [];

this.isRunning = false;

function initCountXingamentos(){

    this.countXingamentosInterval = setInterval(() => {

        let num = xingamentosInTime;
        xingamentosInTime = 0;

        twitter.reportViaDm(bot, num, messagesInterval, `${num} usuários foram tomar no cu em ${messagesInterval} hora`).then(response=>{
            console.log('Mensagem relatório enviada com sucesso!');
        }).catch(err=>{
            console.log(err);
        });

    }, messagesInterval*3600*1000); //envio de mensagens (via DM) informativas

}

function search(q, count){

    return new Promise((resolve, reject)=>{

        bot.get('search/tweets', {q, lang: 'pt', count, result_type: 'recent'}, function(err, data, response) {

            if(err){
                reject(err);
            }
            else{

                let arrayResponse = [];

                if(data.statuses !== undefined){

                    data.statuses.forEach(tweet=>{

                        if(tweet !== undefined && usersXingados.indexOf(tweet.user.screen_name) === -1){
                            arrayResponse.push(tweet.user.screen_name);
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

module.exports = {

    startBot(q, count){

        if(!this.isRunning){

            console.log('vtncBot iniciou');

            this.vtncBotInterval = setInterval(() => {
            
                search(q, count).then(users=>{

                    users.forEach(user=>{
                    
                        let text = `vai tomar no cu @${user}!`
                        twitter.tweet(text, bot).then(response=>{
                            console.log(`Vtnc Bot - Usuário @${user} foi tomar no cu com sucesso!`);
                            usersXingados.push(user);
                        }).catch(err=>{
                            twitter.reportViaDm(bot, '', '', `Erro: ${err.message}`);
                            console.log('Vtnc Bot -', err.message);
                        });

                    });

                });

            }, xingamentosInterval);

            initCountXingamentos();

            this.isRunning = true;

        }
        else{
            console.log('O bot já está em execução!');
        }

    },

    stopBot(){

        if(this.isRunning){
            clearInterval(this.vtncBotInterval);
            clearInterval(this.countXingamentosInterval);
            this.isRunning = false;
            retweetsInTime = 0;
            console.log('vtncBot parou');
        }
        else{
            console.log('O bot não está em execução!');
        }

    }

};