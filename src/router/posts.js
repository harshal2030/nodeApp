const express = require('express');
const auth = require('./../middlewares/auth');
const Post = require('./../models/posts');

const router = express.Router();

router.post('/posts', auth, async (req, res) => {
    try {
        post = req.body;
        post['username'] = req.user.username;
        post['name'] = req.user.name;
        await Post.create(post);
        res.status(201).send()
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router;