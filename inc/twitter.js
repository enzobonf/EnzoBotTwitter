const mailer = require('./mailer');
const db = require('./db');
let botConfigs = db.configs;

function saveBlockedUsers(botName, id, username){

    botConfigs.updateOne({botName}, {$push: {"blockedUsers":`{"id":"${id}", "username":"${username}"}`}}).then(response=>{
        console.log(`Usuário que bloqueou o bot (@${username}) foi adicionado ao banco de dados`);
    }).catch(err=>{
        console.log(err);
    });

}

module.exports = {

    retweet(bot, tweet, botName){
        return new Promise((resolve, reject)=>{
        
            const id = tweet.id_str;

            bot.post('statuses/retweet/:id', {id}, (err, data, response)=>{
                if(!err){
                    resolve({text: tweet.text, id});
                }
                else{

                    let stringError = `${botName} - Erro retweet: ${err.message}`

                    switch(err.code){
                        case 88:

                            mailer.sendEmail(`${botName} - Limite atingido!`, '', `${botName}`, 'enzobonfx@gmail.com').then(response=>{
                                console.log(`Email sobre limite atingido no ${botName} foi enviado`);
                            }).catch(err=>{
                                console.log(err);
                            });
                            
                        case 136:
                            saveBlockedUsers(botName, tweet.user.id_str, tweet.user.screen_name);
                            stringError += ` ---> @${tweet.user.screen_name}`;
                    }

                    reject(stringError);

                }
            });

        });
    },

    verifyIfUserBlocked(botName, id){

        return new Promise((resolve, reject)=>{

            botConfigs.find({botName}).lean().exec().then(response=>{

                let idsBlocked = response[0].blockedUsers.map(json=>{
                    return JSON.parse(json).id;
                });
    
                (idsBlocked.indexOf(id.toString()) !== -1) ? resolve(true) : resolve(false);
            
            }).catch(err=>{
                reject('Erro ao verificar se o autor do tweet bloqueou o bot');
            });

        });

    }

}