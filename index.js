
const enzoBot = require('./enzoBot');
enzoBot.startBot('"Enzo"', 'pt', 5);

//const initBotFoz = require('./botFoz');
//initBotFoz.startBot('20km', 4);

/* const SPBot = require('./spBot');
SPBot.startBot('14mi', 6); */

const db = require('./inc/db');

// Leitura do console para stop/start dos bots:
/* process.stdin.on('readable', ()=>{ 

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
                        initEnzoBot.startBot('"Enzo"', 'pt', 5);
                    break;

                    case 'fozbot':
                        initBotFoz.startBot('20km', 4);
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
    
}); */

let botConfigs = db.configs;

botConfigs.find({}).lean().exec().then(response=>{

    if(response.length === 0){

        botConfigs.insertMany([{
        botName: "EnzoBot",
        running: false,
        blockedUsers: [],
        totalRetweets: 0,
        retweetsPerTime: 0 }, 
        {botName: "FozBot",
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

  