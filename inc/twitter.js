const db = require('./db');
const utils = require('./utils');

let botConfigs = db.configs;

function saveBlockedUsers(botName, id, username){

    botConfigs.updateOne({botName}, {$push: {"blockedUsers":`{"id":"${id}", "username":"${username}"}`}}).then(response=>{
        console.log(`Usuário que bloqueou o bot (@${username}) foi adicionado ao banco de dados`);
    }).catch(err=>{
        console.log(err);
    });

}

function sendDM(bot, text){

    return new Promise((resolve, reject)=>{

        text = text + ' | ' + utils.getDateAndHour();

        bot.post('direct_messages/events/new', {
            event: {
                type: "message_create",
                message_create: {
                    target: {
                        recipient_id: '1135041189403607040' //@enzobonf
                    },
                    message_data: {
                        text
                    }
                }
            }}, (err, response)=>{

            if(!err){
                resolve(response);
            }
            else{
                reject(err);
            }

        });

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

                            sendDM(bot, 'Limite atingido!').then(response=>{
                                console.log('Mensagem sobre o limite ter sido atingido enviada com sucesso!');
                            }).catch(err=>{
                                console.log(err);
                            });;
                            
                        case 136:
                            saveBlockedUsers(botName, tweet.user.id_str, tweet.user.screen_name);
                            stringError += ` ---> @${tweet.user.screen_name}`;
                    }

                    reject(stringError);

                }
            });

        });
    },

    tweet(bot, text,  params = {}){

        return new Promise((resolve, reject)=>{


            bot.post('statuses/update', Object.assign(params, {status: text}), function(err, data, response) {
                if(!err){0
                    resolve(response);
                }
                else{
                    reject(err);
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

    },

    reportViaDm(bot, numRetweets, interval, text = `${numRetweets} retweets em ${interval} hora`){

        return new Promise((resolve, reject)=>{

            sendDM(bot, text).then(response=>{
                resolve(response);
            }).catch(err=>{
                reject(err);
            });

        });

    },
    
    uploadMedia(bot, b64){

        return new Promise((resolve, reject)=>{

            bot.post('media/upload', { media_data: b64 }, function (err, data, response) {

                if(err) return reject(err);

                let mediaIdStr = data.media_id_string;
                resolve(mediaIdStr);

            });

        });

    }

}