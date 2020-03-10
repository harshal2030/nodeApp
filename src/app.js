const express = require('express');
const userRouter = require('./router/user')
const postRouter = require('./router/posts')

const app = express();

app.use(express.json())
app.use(userRouter)
app.use(postRouter)

app.get('/date', (req, res) => {
    const today = new Date()
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();

    const date = dd+'-'+mm+'-'+yyyy
    res.send({date})
})

module.exports = app;