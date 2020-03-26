const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const Friend = require('./../models/friend')
const auth = require('./../middlewares/auth')

router.post('/users', async (req, res) => {
    /**
     * Route for sigining up a user
     * 201 for success
     * 400 for failure
     * need to add more status
     */
    try {
        const user = await User.create(req.body);
        user['avatarPath'] = process.env.TEMPURL + user['avatarPath'];
        const token = await user.generateAuthToken();
        const userData = user.removeSensetiveUserData()
        res.status(201).send({user: userData, token})
    } catch (e) {
        res.status(400).send(e)
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
        user['avatarPath'] = process.env.TEMPURL + user['avatarPath'];
        const token = await user.generateAuthToken();
        const userData = user.removeSensetiveUserData()
        res.send({user: userData, token})
    } catch (e) {
        res.status(404).send(e)
    }
})

// GET /users/username
router.get('/users/:username', async (req, res) => {
    /**
     * Route for fetching user profile
     * 200 for success
     * 404 for not found
     * need to support for private account
     */
    try {
        const user = await User.findOne({where: {username: req.params.username}});
        if (!user) {
            throw new Error("No user found")
        }
        const userData = user.removeSensetiveUserData();
        const followers = await Friend.count({where: {followed_username: req.params.username}});
        const follwing = await Friend.count({where: {username: req.params.username}});
        userData['avatarPath'] = process.env.TEMPURL + user['avatarPath']
        userData['followers'] = followers
        userData['following'] = follwing
        res.send(userData);
    } catch (e) {
        res.status(404).send()
    }
})

// GET /users/username/full
router.get('/users/:username/full', auth, async (req, res) => {
    /**
     * Route to get user profile with addintional info like isFollowing.
     * 200 for success
     * 404 for no user
     */
    try {
        const user = await User.findOne({where: {username: req.params.username}});
        if (!user) {
            throw new Error("No user found")
        }
        const userData = user.removeSensetiveUserData();
        const followers = await Friend.count({where: {followed_username: req.params.username}});
        const follwing = await Friend.count({where: {username: req.params.username}});
        userData['avatarPath'] = process.env.TEMPURL + user['avatarPath']
        userData['followers'] = followers
        userData['following'] = follwing

        const requester = req.user.username;
        const isFollowing = await Friend.findOne({
            where: {
                username: requester,
                followed_username: req.params.username
            }
        })

        if (!isFollowing) {
            userData['isFollowing'] = false;
        } else {
            userData['isFollowing'] = true;
        }

        res.send(userData);
    } catch (e) {
        res.status(404).send(e)
    }
})

router.post('/users/follow', auth, async (req, res) => {
    try {
        const userExists = await User.findOne({where: {username: req.body.username}})
        if (!userExists) {
            throw new Error('No such user exists');
        }

        if (req.user.username === req.body.username) {
            throw new Error('Got identical value pair.');
        }

        await Friend.create({
            username: req.user.username,
            followed_username: req.body.username,
        })
        res.status(201).send();
    } catch (e) {
        res.status(400).send();
    }
})

router.delete('/users/follow', auth, async (req, res) => {
    try {
        const unfollowed = await Friend.destroy({
            where: {
                username: req.user.username,
                followed_username: req.body.username,
            }
        })

        if (req.user.username === req.body.username) {
            throw new Error('Got identical value pair.')
        }

        if (!unfollowed) {
            throw new Error('No such entry exists')
        }

        res.send()
    } catch (e) {
        res.send(400).send();
    }
})


// GET /users/username/followers?skip=0&limit=30
router.get('/users/:username/followers', auth, async (req, res) => {
    /**
     * Route for getting user followers
     */
    const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit);
    try {
        const followers = await Friend.getUserFollowers(req.params.username, skip, limit);
        for (let i=0; i<followers.length; i++) {
            followers[i].avatarPath = process.env.TEMPURL + followers[i].avatarPath;
        }
        if (!followers) {
            throw new Error('Something went wrong');
        }

        res.send(followers);
    } catch (e) {
        res.status(500).send()
    }
})

// GET /users/username/following?skip=0&limit=30
router.get('/users/:username/following', auth, async (req, res) => {
    /**
     * Route for getting user following
     */
    const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit);
    try {
        const following = await Friend.getUserFollowing(req.params.username, skip, limit);
        if (!following) {
            throw new Error('Something went wrong');
        }

        for (let i=0; i<following.length; i++) {
            following[i].avatarPath = process.env.TEMPURL + following[i].avatarPath;
        }

        res.send(following);
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router;