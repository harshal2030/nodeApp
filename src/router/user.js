const express = require('express')
const router = express.Router()
const User = require('./../models/user')

router.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        const token = await user.generateAuthToken();
        const userData = user.removeSensetiveUserData()
        res.status(201).send({user: userData, token})
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const userData = user.removeSensetiveUserData()
        res.send({user: userData, token})
    } catch (e) {
        res.status(404).send(e)
    }
})

router.get('/users/:user', async (req, res) => {
    try {
        const user = await User.findOne({where: {username: req.params.user}});
        user['avatarPath'] = 'http://192.168.43.26:3000/' + user['avatarPath']
        const userData = user.removeSensetiveUserData();
        if (!user) {
            throw new Error("No user found")
        }
        res.send(userData);
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router;