
const initEnzoBot = require('./enzoBot');
initEnzoBot.startBot('"Enzo"', 'pt', 4);

const initBotFoz = require('./botFoz');
initBotFoz.startBot('20km', 4);

//const db = require('./inc/db');

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

/* let botConfigs = db.configs;

let botName = 'EnzoBot'
let id = '123456';
let username = 'teste2';

let json = `{"id": "${id}", "username": "${username}"}`;

botConfigs.updateOne({botName}, {$push: {"blockedUsers":`{"id":"${id}", "username":"${username}"}`}}).then(response=>{
    console.log(response.nModified);
}); 

botConfigs.find({botName: 'enzoBot'}).update({}, {$push: {"blockedUsers":'{"id": "838214362", "username": "@teste2"}'}}).then(response=>{
    console.log(response.nModified);
});

let idsBlocked = [];

botConfigs.find({botName}).lean().exec().then(response=>{

    idsBlocked = response[0].blockedUsers.map(json=>{
        return JSON.parse(json).id;
    });

    console.log(idsBlocked);

});




botConfigs.watch({running}).on('change', (change)=>{
    console.log(change);
}); */

  