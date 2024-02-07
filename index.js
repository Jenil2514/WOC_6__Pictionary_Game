const bodyParser = require('body-parser');
const express = require('express');
// const { Socket } = require('node:dgram');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const randomWord = require('random-word-slugs');

const app = express();
const server = createServer(app);

const io = new Server(server);
// app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css', express.static('css'));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/nodejs', express.static(join(__dirname, 'nodejs')));


app.get('/', (req, res) => {
    // console.log(req.params);
    res.sendFile(join(__dirname, 'index.html'));
});
app.get('/draw.html', (req, res) => {
    res.sendFile(join(__dirname, 'draw.html'));
});
// app.post('/join', (req, res) => {
//     const name = req.body.name2;
//     const room_id = req.body.room_id;

//     res.sendFile(join(__dirname, 'draw.html'), {
//         name: name,
//         room_id: room_id
//     });
// });




io.on('connection', (Socket) => {
    console.log('server connected');
    Socket.emit('connected');
    Socket.on('disconnect', () => {
        console.log('user disconnected');
    })

    // Socket.on('Create_room',(username,room_id)=>{
    // console.log(`Username ${username} , Room Id: ${room_id}`);
    // io.emit("User_connected",username,room_id);

    // });

    Socket.on('join_room', (u_name, r_id) => {
        console.log(u_name);
        Socket.join(r_id);
        io.to(r_id).emit("joined_room", {u_name, r_id});
    });
    Socket.on('start_game', (room_id) => {
        io.to(room_id).emit('game_started');
        startGame(room_id);
    });
    Socket.on('send_message', (messageData) => {
        // Emit message to the specific room
        // console.log(messageData.txt);
        io.to(messageData.room_id).emit("receive_message", {
            username: messageData.username,
            txt: messageData.txt,
            room_id: messageData.room_id
        });
    });
});


function startGame(room_id) {
    const word = randomWord;
    const wordLength = word.length;

    // Emit the word and its length to the drawer
    io.to(room_id).emit('word_to_drawer', { word, wordLength });

    // Get the room
    const room = io.sockets.adapter.rooms.get(room_id);
    if (!room) {
        console.log(`Room ${room_id} doesn't exist.`);
        return;
    }

    // Get the sockets in the room
    const sockets = room.sockets;
    if (!sockets || sockets.size === 0) {
        console.log(`Room ${room_id} doesn't have any sockets.`);
        return;
    }

    // Set timer for each turn (e.g., 60 seconds)
    const turnTime = 60000; // 60 seconds
    const players = Object.keys(sockets);

    let currentPlayerIndex = 0;

    function takeTurn() {
        const currentPlayerSocketId = players[currentPlayerIndex];
        const currentPlayerSocket = io.sockets.sockets[currentPlayerSocketId];

        // Emit turn start event to the current player
        currentPlayerSocket.emit('your_turn', turnTime);

        // Increment current player index for next turn
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

        // Set timeout for next turn
        setTimeout(takeTurn, turnTime);
    }

    // Start taking turns
    takeTurn();
}


server.listen(3000, () => {
    console.log('Server running at port 3000');
});

