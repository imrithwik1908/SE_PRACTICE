require('dotenv').config() // Require dotenv library to access env variables

var mongoose = require('mongoose');
 
mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat')

const app = require('express')()

const http = require('http').Server(app);

const userRoute = require('./routes/userRoutes');
const User = require('./models/userModel');



app.use('/',userRoute)

const io = require('socket.io')(http)

var usp = io.of('/user-namespace'); // Namespace 

usp.on('connection', async(socket) => {
    console.log('User Connected!!')

    var userId = socket.handshake.auth.token

    // console.log(userId)

    await User.findByIdAndUpdate({_id: userId}, {$set: {isOnline: "1"}})

    // user brodcast online status

    socket.broadcast.emit('getOnlineUser', {user_id: userId})

    socket.on('disconnect', async () => {
        console.log("User Disconnected!!")

        var userId = socket.handshake.auth.token

        await User.findByIdAndUpdate({_id: userId}, {$set: {isOnline: "0"}})

        socket.broadcast.emit('getOfflineUser', {user_id: userId})
    })
})

http.listen(8000, () => {
    console.log("Server is running on port 8000")
}) 