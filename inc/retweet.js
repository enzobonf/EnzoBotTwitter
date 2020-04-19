const mailer = require('./mailer');

module.exports = (bot, tweet, botName) => {

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
                        stringError += ` ---> @${tweet.user.screen_name}`;
                }

                reject(stringError);

            }
        });

    });

}