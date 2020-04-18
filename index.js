
const initEnzoBot = require('./enzoBot');
initEnzoBot.startBot('"Enzo"', 'pt', 4);

const initBotFoz = require('./botFoz');
initBotFoz.startBot('20km', 4);

/* const db = require('./inc/db');
db(); */

// Leitura do console para stop/start dos bots:
process.stdin.on('readable', ()=>{ 

    let variable = process.stdin.read(), comm, args;
    if(variable !== null){
        variable = variable.toString().replace(/\n/, ""); 
        variable = variable.replace(/\r/, ""); 

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
  