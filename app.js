const express = require('express');
const app = express();
const ejs = require('ejs');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const config = require('config');
const request = require('request');

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = 3000;
const socketList=[];
let turn;

if(!config.get('apiKey')){
    console.log('FATAL ERROR! API key not provided');
    process.exit(1);
}

const server = app.listen(PORT, ()=>{
    console.log(`Server started at PORT ${PORT}`);
});

const io = socket(server);

io.on('connection', socket=>{
    if(socketList.length<2){
        socketList.push(socket.id);

        socket.on('newGameTurn', ()=>{
            if(socketList.length===2){
                turn = socketList[Math.floor(Math.random()*2)];
                io.sockets.emit('activeTurn', turn);
            }
        });

        socket.on('activeTurn', turnID=>{
            turnIndex = (socketList.indexOf(turnID)===0 ? 1 : 0);
            turn = socketList[turnIndex];
            io.sockets.emit('activeTurn', turn);
        });

        // console.log('Socket Connection Made!', socket.id);
        socket.on('wordPlayed', wordInfo=>{
            // io.sockets.emit('wordEntered', word);
            socket.broadcast.emit('playedWord', wordInfo);
        });

        socket.on('typing', ()=>{
            socket.broadcast.emit('typing');
        });

        socket.on('typingStopped', ()=>{
            socket.broadcast.emit('typingStopped');
        });
    }

    socket.on('disconnect', ()=>{
        socketList.splice(socketList.indexOf(socket.id),1);
        socket.broadcast.emit('disconnected');
    });
});

app.get('/', (req,res)=>{
    res.render('index');
});

app.post('/verify', async (req,res)=>{
    const url = config.get('baseURL')+config.get('apiKey')+'&text='+req.body.word;
    request(url, (error, response, body)=>{
        if(!error && response.statusCode===200){
            const wordInfo = JSON.parse(body);
            const verifiedWord = (wordInfo.def.length>0);
            if(verifiedWord)
                res.status(200).send('Verified Word');
            else
                res.status(400).send('Invalid Word');
        }
        else{
            console.log(error);
            res.status(400).send('Something went wrong!');
        }
    });
});
