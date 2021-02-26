require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 8000
const { v4:uuidV4 } = require('uuid')

// App Config
app.set('view engine' , 'ejs')
app.use(express.static('public'))

// Routes
app.get('/' , (req , res) => {
    res.render('home')
})
app.get('/new-room' , (req , res) => {
    res.redirect(`/room/${uuidV4()}`)
})
app.get('/room/:roomId' , (req , res) => {
    res.render('room' , {roomId: req.params.roomId})
})

// io
io.on('connection' , socket => {
    socket.on('join-room' , (roomId , userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected' , userId)
        socket.on('disconnect' , () => {
            socket.to(roomId).broadcast.emit('user-disconnected' , userId)
        })
    })
})

// Start Server
server.listen(port , () => console.log(`- Server is Runing on Port ${port}`))