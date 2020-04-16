module.exports = (bot, tweet) => {

    return new Promise((resolve, reject)=>{
    
        const id = tweet.id_str;

        bot.post('statuses/retweet/:id', {id}, (err, data, response)=>{
            if(!err){
                resolve({text: tweet.text, id});
            }
            else{
                reject(err);
            }
        });

    });

}