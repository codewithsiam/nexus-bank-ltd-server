const express = require('express');
const { io } = require('..');
const router = express.Router();

io.on("connection" , (socket) => {
    console.log('We are connected')
 
    socket.on("chat" , chat => {
       io.emit('chat' , chat)
    } )
 
    socket.on('disconnect' , ()=> {
     console.log('disconnected')
    })
 })

console.log('hasan')
module.exports = router;