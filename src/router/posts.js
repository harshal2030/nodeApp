const express = require('express');
const auth = require('./../middlewares/auth');
const Post = require('./../models/post');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const uuidv4 = require('uuid/v4');
const Bookmark = require('./../models/bookmark');
const {Op} = require('sequelize');
const Like = require('./../models/like');

const router = express.Router();
const postImgPath = path.join(__dirname, '../../public/images/posts')

const upload = multer({
    limits: {
        fileSize: 20 * 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(Error("Unsupported files uploaded to the server"))
        }

        cb(undefined, true)
    }
})

const mediaMiddleware = upload.fields([
    {name: 'image', maxCount: 1},
    {name: 'video'}
])

router.post('/posts', auth, mediaMiddleware, async (req, res) => {
    /**
     * Route for posting the post from user.
     * user info from auth middleware (req.body)
     * Current token from auth middleware (req.token)
     * name for image = image
     * post info contained in req.body.info
     * imagePath: public/images/post
     * 201 for success
     */
    try {
        post = JSON.parse(req.body.info); // post info
        post.username = req.user.username;
        post['name'] = req.user.name;
        
        const file = req.files;
        if (file.image !== undefined) {
            console.log('if of imAGE')
            const filename = `${uuidv4()}.png`;
            const filePath = postImgPath + '/' + filename;
            await sharp(file.image[0].buffer).png().toFile(filePath);
            post['mediaPath'] = '/images/posts/' + filename;
            post['mediaIncluded'] = true;    
        }
        await Post.create(post);
        res.status(201).send()
    } catch(e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// GET /posts?skip = 0&limit = 20
router.get('/posts', auth, async (req, res) => {
    /**
     * Route for home feed of a user
     * Full function in posts
     * 200 for success
     */
    const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit);
    try {
        const posts = await Post.getUserFeed(req.user.username, skip, limit)
        const data = []
        const bookmark = await Bookmark.getUserBookmarksIds(req.user.username, skip, limit);
        

        for(let i=0; i<posts.length; i++) {
            data.push(posts[i])
            posts[i].mediaPath = process.env.TEMPURL + posts[i].mediaPath;
            posts[i].avatarPath = process.env.TEMPURL + posts[i].avatarPath;
            if (bookmark.includes(posts[i].postId)) {
                posts[i]['bookmarked'] = true
            } else {
                posts[i]['bookmarked'] = false
            }
        }
        res.send(data);
    } catch (e) {
        res.status(400).send(e)
    }
})

//GET /posts/username/media?skip=0&limit=20
router.get('/posts/:username/media', auth, async (req, res) => {
    /**
     * Route for getting list url for images for specified user
     * 200 for success
     * 404 for no media or non associated user
     */
    const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? 20 : parseInt(req.query.limit);

    try {
        const media = await Post.findAll({
            where: {
                username: req.params.username,
                mediaPath: {
                    [Op.not]: null,
                }
            },
            raw: true,
            attributes: ['mediaPath', 'likes', 'comments'],
            offset: skip,
            limit: limit,
        })

        if (!media || media.length === 0) {
            throw new Error('Mentioned user has no media associated.')
        }

        res.send(media)
    } catch (e) {
        res.status(404).send()
    }
})

// GET /posts/username/stars?skip=0&limit=20
router.get('/posts/:username/stars', auth, async (req, res) => {
    /**
     * route to get stars of user
     */
    const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit);
    try {
        const likes = await Like.getUserLikes(req.params.username, skip, limit);
        if (!likes) {
            throw new Error('Nothing found for user');
        }

        for (let i=0; i<likes.length; i++) {
            likes[i].mediaPath = process.env.TEMPURL + likes[i].mediaPath;
            likes[i].avatarPath = process.env.TEMPURL + likes[i].avatarPath;
        }
        res.send(likes);
    } catch (e) {
        res.status(404).send();
    }
})

// GET /posts/username?skip=0&limit=20
router.get('/posts/:username', async (req, res) => {
    /**
     * Route for posts of a user (req.params.username)
     * 404 if no posts
     * 200 with atleast one post
     */
    const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit);
    try {
        const username = req.params.username;
        const posts = await Post.getUserPosts(username, skip, limit);

        if (!posts) {
            return res.status(404).send('No Posts yet')
        }
        for (let i=0; i<posts.length; i++) {
            posts[i].mediaPath = process.env.TEMPURL + posts[i].mediaPath;
            posts[i].avatarPath = process.env.TEMPURL + posts[i].avatarPath;
        }
        res.send(posts)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/posts/trends/:username', auth, (req, res) => {
    res.send('coming soon');
})

module.exports = router;