const express = require('express');
const { Socket } = require('node:dgram');
const { createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);

const io = new Server(server);
app.use('/css',express.static('css'));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/nodejs', express.static(join(__dirname, 'nodejs')));


app.get('/',(req,res)=>{
    // console.log(req.params);
    res.sendFile(join(__dirname,'index.html'));
});
app.get('/draw.html', (req, res) => {
    res.sendFile(join(__dirname, 'draw.html'));
});

io.on('connection',(Socket)=>{
    console.log('server connected');
    Socket.emit('connected');
    Socket.on('disconnect',()=>{
        console.log('user disconnected');
    })

    // Socket.on('Create_room',(username,room_id)=>{
    // console.log(`Username ${username} , Room Id: ${room_id}`);
    // io.emit("User_connected",username,room_id);

    // });
    
    Socket.on('join_room',(u_name,r_id)=>{
        Socket.join(r_id);
        io.to(r_id).emit("joined_room",u_name,r_id);
    })
});

server.listen(3000,()=>{
    console.log('Server running at port 3000');
});

