const express = require('express');
const { Socket } = require('node:dgram');
const { createServer} = require('node:http');
const path = require('node:path');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);

const io = new Server(server);
app.use('/css',express.static('css'));

app.use(express.static(join(__dirname, 'nodejs')));

app.get('/',(req,res)=>{
    // console.log(req.params);
    res.sendFile(join(__dirname,'index.html'));
});

io.on('connection',(Socket)=>{
    console.log('server connected');
    Socket.emit('connected');
    Socket.on('disconnect',()=>{
        console.log('user disconnected');
    })
    Socket.on('chat message',(msg)=>{
        console.log('message: ',msg);
        Socket.broadcast.emit(msg);
    })
    
});

server.listen(3000,()=>{
    console.log('Server running at port 3000');
});

