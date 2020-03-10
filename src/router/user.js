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

module.exports = router;