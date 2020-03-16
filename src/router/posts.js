const express = require('express');
const auth = require('./../middlewares/auth');
const Post = require('./../models/post');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const uuidv4 = require('uuid/v4');

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


// POST /posts/misc?option=bookmark
router.post('/posts/misc', auth, async (req, res) => {
    /**
     * Route for adding misc to database
     * 201 for success
     * 403 for success
     */
    try {
        if (req.query.option === 'bookmark') {
            const bookmarkAdded = await Post.addBookmark(req.user.username, req.body.postId)
            if (bookmarkAdded) {
                res.status(201).send()
            } else { // will get removed automatically
                res.status(403).send()
            }
        }
    } catch (e) {
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
        for(let i=0; i<posts.length; i++) {
            data.push({type: 'NORMAL', item: posts[i]})
            posts[i].mediaPath = 'http://192.168.43.26:3000' + posts[i].mediaPath;
        }
        res.send(data)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

// GET /posts/misc?option=bookmark
router.get('/posts/misc/', auth, async (req, res) => {
    /**
     * Route to fetch user misc posts
     * 200 success
     */
    try {
        if (req.query.option === 'bookmark') {
            const bookmarks = await Post.getUserBookmarks(req.user.username)
            const data = []
            for(let i=0; i<bookmarks.length; i++) {
                bookmarks[i].mediaPath = 'http://192.168.43.26:3000' + bookmarks[i].mediaPath
                data.push({type: 'NORMAL', item: bookmarks[i]})
            }
            res.send(data)
        }
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/posts/:username', async (req, res) => {
    /**
     * Route for posts of a user (req.params.username)
     * 404 if no posts
     * 200 with atleast one post
     */
    try {
        const username = req.params.username;
        const posts = await Post.findAll({where: {username}})

        if (!posts) {
            return res.status(404).send('No Posts yet')
        }

        res.send(posts)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router;