const express = require('express')
const router = express.Router()
const User = require('./../models/user')

router.post('/users', async (req, res) => {
    /**
     * Route for sigining up a user
     * 201 for success
     * 400 for failure
     * need to add more status
     */
    try {
        const user = await User.create(req.body);
        user['avatarPath'] = 'http://192.168.43.26:3000/' + user['avatarPath'];
        const token = await user.generateAuthToken();
        const userData = user.removeSensetiveUserData()
        res.status(201).send({user: userData, token})
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/users/login', async (req, res) => {
    /**
     * Route to login the user
     * 200 for success
     * 404 for not found
     */
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        user['avatarPath'] = 'http://192.168.43.26:3000/' + user['avatarPath'];
        const token = await user.generateAuthToken();
        const userData = user.removeSensetiveUserData()
        res.send({user: userData, token})
    } catch (e) {
        res.status(404).send(e)
    }
})

// GET /users/username
router.get('/users/:user', async (req, res) => {
    /**
     * Route for fetching user profile
     * 200 for success
     * 404 for not found
     * need to support for private account
     */
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