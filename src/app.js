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
const Friend = require('./models/friend');
const auth = require('./middlewares/socketAuth');
const {Op} = require('sequelize');

const app = express();
const server = http.createServer(app);

const searchSocket = socketio(server, {
    path: '/search'
})
const likeSocket = socketio(server, {
    path: '/like'
})
const validationSocket = socketio(server, {
    path: '/validation'
})

searchSocket.use(auth);
likeSocket.use(auth);

searchSocket.on('connection', (socket) => {
    socket.on('query', async (query) => {
        try {
            const users_raw = await sequelize.query(`SELECT name, username, "avatarPath" FROM users 
            WHERE (LOWER(name) LIKE LOWER('${query}%') OR LOWER(username) LIKE LOWER('${query}%'))`, {
                raw: true
            });

            const users = users_raw[0];

            const isFollowing = await Friend.findAll({
                where: {
                    username: socket.user.username,
                    followed_username: {
                        [Op.in]: users.map(user => user.rusername)
                    }
                },
                attributes: ['followed_username'],
                raw: true,
            }).map(follo => follo.followed_username)

            const follows_you = await Friend.findAll({
                where: {
                    followed_username: socket.user.username,
                    username: {
                        [Op.in]: users.map(user => user.username)
                    }
                },
                attributes: ['username'],
                raw: true,
            }).map(follo => follo.username)

            for (let i=0; i<users.length; i++) {
                users[i].avatarPath = process.env.TEMPURL + users[i].avatarPath;

                if (isFollowing.includes(users[i].username)) {
                    users[i]['isFollowing'] = true
                } else {
                    users[i]['isFollowing'] = false
                }

                if (follows_you.includes(users[i].username)) {
                    users[i]['follows_you'] = true;
                } else {
                    users[i]['follows_you'] = false;
                }
            }
        socket.emit('users', users);
        } catch (e) {
            // Send users in similar location
        }
    })
})

likeSocket.on('connection', (socket) => {
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
                likedBy: socket.user.username,
                postedBy: data.postedBy
            }})

            if (isPresent) {
                throw 'Present'
            }

            const likes = await Post.like(data.postId, socket.user.username, data.postedBy);
            likeSocket.emit('likeUpdate', {postId: data.postId, update: likes});
        } catch (e) {
            if (e === 'Present') {
                await Like.destroy({where: {
                    postId: data.postId,
                    likedBy: socket.user.username,
                    postedBy: data.postedBy,
                }})
                Post.increment({likes: -1}, {where: {postId: data.postId}})
            }
            const likes = await Like.count({where: {postId: data.postId}})
            likeSocket.emit('likeUpdate', {postId: data.postId, update: likes})
        }
    })
})

validationSocket.on('connection', (socket) => {
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