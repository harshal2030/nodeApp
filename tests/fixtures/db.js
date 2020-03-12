const User = require('./../../src/models/user')
const Post = require('../../src/models/post')
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')

const user1 = {
    name: 'harshal',
    username: 'harshal2030',
    email: 'harshal@example.com',
    adm_num: '23234',
    password: 'qwertyy',
    tokens: [jwt.sign({username: 'harshal2030'}, 'testinganodeapp')]
}

const user2 = {
    name: 'mike',
    username: 'mike2030',
    email: 'mike@example.com',
    adm_num: '56545',
    password: 'asdfghjk',
    tokens: [jwt.sign({username: 'mike2030'}, 'testinganodeapp')]
}

const post1 = {
    postId: uuidv4(),
    title: 'post 1',
    description: 'body 1'
}

const post2 = {
    postId: uuidv4(),
    title: 'post 2',
    description: 'body 2'
}

const post3 = {
    postId: uuidv4(),
    title: 'post 3',
    description: 'body 3'
}

const post4 = {
    postId: uuidv4(),
    title: 'post 4',
    description: 'body 4'
}

const setupDatabse = async () => {
    await User.destroy({where: {}, truncate: true})
    await User.destroy({where: {}, truncate: true})
    await User.create(user1)
    await User.create(user2)
    await Post.create(post1)
    await Post.create(post2)
    await Post.create(post3)
    await Post.create(post4)
}

module.exports = {
    user1,
    user2,
    post1,
    post2,
    post3,
    post4,
    setupDatabse
}