const express = require('express');
const userRouter = require('./router/user')
const postRouter = require('./router/posts')
const miscRouter = require('./router/misc')
const settingRouter = require('./router/settings')
const path = require('path')
const http = require('http')
const socketio = require('socket.io');
const sequelize = require('./db');
const Like = require('./models/like');
const Post = require('./models/post');
const User = require('./models/user');

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

    socket.on('hitLike', async (data) => {
        try {
            const didPostExists = await Post.findOne({
                where: {postId: data.postId}
            })

            if (!didPostExists) {
                throw 'no such post'
            }

            const isPresent = await Like.findOne({where:{
                postId: data.postId,
                likedBy: data.username,
                postedBy: data.postedBy
            }})

            if (isPresent) {
                throw 'Present'
            }

            const likes = await Post.like(data.postId, data.username, data.postedBy);
            io.emit('likeUpdate', {postId: data.postId, update: likes});
        } catch (e) {
            if (e === 'Present') {
                await Like.destroy({where: {
                    postId: data.postId,
                    likedBy: data.username,
                    postedBy: data.postedBy,
                }})
                Post.increment({likes: -1}, {where: {postId: data.postId}})
            }
            const likes = await Like.count({where: {postId: data.postId}})
            io.emit('likeUpdate', {postId: data.postId, update: likes})
        }
    })

    socket.on('usernameValidation', async (username) => {
        const userCount = await User.count({
            where: {
                username: username.toLowerCase()
            }
        })

        if (userCount !== 0) {
            return socket.emit('usernameValidation', true)
        }

        return socket.emit('usernameValidation', false)
    })

    socket.on('emailValidation', async (email) => {
        const userCount = await User.count({
            where: {
                email
            }
        })

        if (userCount !== 0) {
            return socket.emit('emailValidation', true)
        }

        return socket.emit('emailValidation', false);
    })
})

const publicDirPath = path.join(__dirname, '../public')

app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.use(miscRouter)
app.use(settingRouter)
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