const express = require('express');
const app = express();
const ejs = require('ejs');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const config = require('config');
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('req-flash');

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true
}));
app.use(flash({locals: 'flash'}));

app.use((req,res, next)=>{
    res.locals.error_msg = req.flash('error_msg');
    next();
});

const port = process.env.PORT || 3000;
const rooms = new Map();
let turn;
let deleteRoom;

if(!config.get('apiKey')){
    console.error('FATAL ERROR! API key not provided');
    process.exit(1);
}

const server = app.listen(port, ()=>{
    console.log(`Server started at PORT ${port}`);
});

const io = socket(server);

io.on('connection', socket=>{
    const roomID=socket.handshake.query.roomID;
    if(!Array.isArray(rooms.get(Number(roomID)))){
        clearTimeout(rooms.get(Number(roomID)));
        rooms.set(Number(roomID), []);
    }
    const roomArr = rooms.get(Number(roomID));
    roomArr.push(socket.id);

    // console.log(rooms);

    socket.join(roomID);

    socket.on('newGameTurn', ()=>{
        if(roomArr.length===2){
            turn = roomArr[Math.floor(Math.random()*2)];
            io.to(roomID).emit('activeTurn', turn);
        }
    });

    socket.on('activeTurn', turnID=>{
        turnIndex = (roomArr.indexOf(turnID)===0 ? 1 : 0);
        turn = roomArr[turnIndex];
        io.to(roomID).emit('activeTurn', turn);
    });

    socket.on('wordPlayed', wordInfo=>{
        socket.to(roomID).emit('playedWord', {
            word: wordInfo.word,
            point: wordInfo.point
        });
    });

    socket.on('typing', ()=>{
        socket.to(roomID).emit('typing');
    });

    socket.on('typingStopped', ()=>{
        socket.to(roomID).emit('typingStopped');
    });
    
    socket.on('disconnect', ()=>{
        roomArr.splice(roomArr.indexOf(socket.id),1);
        if(roomArr.length===0)
            rooms.delete(Number(roomID));
        socket.to(roomID).emit('disconnected');
        // console.log(rooms);
    });
});

app.get('/', (req,res)=>{
    res.render('index', req.flash());
});

app.post('/verify', async (req,res)=>{
    const url = config.get('baseURL')+config.get('apiKey')+'&text='+req.body.word;
    request(url, (error, response, body)=>{
        if(!error && response.statusCode===200){
            const wordInfo = JSON.parse(body);
            const verifiedWord = (wordInfo.def.length>0);
            if(verifiedWord)
                res.status(200).send('VERIFIED WORD');
            else
                res.status(400).send('INVALID WORD');
        }
        else{
            console.log(error);
            res.status(400).send('SOMETHING WENT WRONG');
        }
    });
});

app.get('/room/create', (req,res)=>{
    let unique = false;
    let roomID;
    while(!unique){
        // Generating a random 6 digit number
        roomID = Math.floor(Math.random()*900000)+100000;
        if(rooms.size!==0){
            for(const [key, value] of rooms){
                if(key===roomID){
                    unique=false;
                    break;
                }
                unique=true;
            }
        }
        else
            unique = true;
    }
    rooms.set(roomID, setTimeout(()=>{ 
        rooms.delete(roomID);
        // console.log(rooms); 
    }, 300000));
    // console.log(rooms);
    res.status(200).send(roomID.toString());
});

app.post('/room', (req,res)=>{
    const roomID=req.body.roomID;
    res.redirect(`/room/${roomID}`);
});

const auth = (req,res,next)=>{
    roomID=Number(req.params.id);
    let isValidRoom=rooms.has(roomID);
    if(!isValidRoom){
        req.flash('error_msg', 'Room Doesn\'t exist');
        res.redirect('/');
    }
    else if(rooms.get(roomID).length>=2){
        req.flash('error_msg', 'Access Denied! Room Full');
        res.redirect('/');
    }
    else
        next();
}

app.get('/room/:id', auth, (req,res)=>{
    res.render('game');
});
