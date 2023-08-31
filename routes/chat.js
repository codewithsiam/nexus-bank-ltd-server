const express = require('express');
const { io } = require('..');
const router = express.Router();

io.on("connection" , (socket) => {
   
 
    socket.on("chat" , chat => {
       io.emit('chat' , chat)
    } )
 
    socket.on('disconnect' , ()=> {
    
    })
 })


module.exports = router;