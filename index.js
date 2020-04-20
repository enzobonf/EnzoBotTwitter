
const initEnzoBot = require('./enzoBot');
initEnzoBot.startBot('"Enzo"', 'pt', 4);

const initBotFoz = require('./botFoz');
initBotFoz.startBot('20km', 4);

const db = require('./inc/db');

// Leitura do console para stop/start dos bots:
process.stdin.on('readable', ()=>{ 

    let variable = process.stdin.read(), comm, args;
    if(variable !== null){
        variable = variable.toString().replace(/\n/, ""); 
        variable = variable.replace(/\r/, "").toLowerCase(); 

        comm = variable.split(' ')[0];
        args = variable.split(' ')[1];

        switch(comm){
            case 'start':
                switch(args){
                    case 'enzobot':
                        initEnzoBot.startBot();
                    break;

                    case 'fozbot':
                        initBotFoz.startBot();
                    break;
                }
            break;

            case 'stop':
                switch(args){
                    case 'enzobot':
                        initEnzoBot.stopBot();
                    break;

                    case 'fozbot':
                        initBotFoz.stopBot();
                    break;
                }
            break;
        }
        
    }
    
});

let botConfigs = db.configs;

let botName = 'EnzoBot'
let id = '123456';
let username = 'teste2';

let json = `{"id": "${id}", "username": "${username}"}`;

/* botConfigs.updateOne({botName}, {$push: {"blockedUsers":`{"id":"${id}", "username":"${username}"}`}}).then(response=>{
    console.log(response.nModified);
}); 

botConfigs.find({botName: 'enzoBot'}).update({}, {$push: {"blockedUsers":'{"id": "838214362", "username": "@teste2"}'}}).then(response=>{
    console.log(response.nModified);
}); */

/* botConfigs.create({
        botName: "EnzoBot",
    running: false,
    blockedUsers: [],
    totalRetweets: 0,
    retweetsPerTime: 0 });
 */

botConfigs.find({}).lean().exec().then(response=>{
    
    console.log(response.length);
    if(response.length === 0){

        botConfigs.insertMany([{
            botName: "EnzoBot",
        running: false,
        blockedUsers: [],
        totalRetweets: 0,
        retweetsPerTime: 0 }, {botName: "FozBot",
        running: false,
        blockedUsers: [],
        totalRetweets: 0,
        retweetsPerTime: 0 }], (err, response)=>{
            if(!err){
                console.log('documentos criados com sucesso!');
            }
            else{
                console.log(err);
            }
        });

    }

});




/* botConfigs.watch({running}).on('change', (change)=>{
    console.log(change);
});  */

  