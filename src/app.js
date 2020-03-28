const express = require('express');
const userRouter = require('./router/user')
const postRouter = require('./router/posts')
const path = require('path')
const miscRouter = require('./router/misc')
const http = require('http')
const socketio = require('socket.io');
const sequelize = require('./db');

const app = express();
const server = http.createServer(app);

const io = socketio(server);

io.on('connection', (socket) => {
    socket.on('query', async (query) => {
        try {
            const users = await sequelize.query(`SELECT name, username, "avatarPath" FROM users 
            WHERE (LOWER(name) LIKE LOWER('${query}%') OR LOWER(username) LIKE LOWER('${query}%'))`, {
                raw: true
            });
        for (let i=0; i<users[0].length; i++) {
            users[0][i].avatarPath = process.env.TEMPURL + users[0][i].avatarPath;
        }
        //console.log(users[0])
        socket.emit('users', users[0]);
        } catch (e) {
            // Send users in similar location
        }
    })

    const test = ['a36d4e38-ec68-4671-85b0-3321284655ef', '10ae2390-4d8d-49cc-a1ed-0e047c18d46a'];
    socket.emit("likeUpdateInit");
    socket.on('likeUpdate', (postId) => {
        if (test.includes(postId)) {
            socket.emit('likeUpdate', 2)
        }
    })

})

const publicDirPath = path.join(__dirname, '../public')

app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.use(miscRouter)
app.use(express.static(publicDirPath))

app.get('/date', (req, res) => {
    const today = new Date()
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();

    const date = dd+'-'+mm+'-'+yyyy
    res.send({date})
})

module.exports = server;