const express = require('express');
const {auth, optionalAuth} = require('./../middlewares/auth');
const Post = require('./../models/post');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4 } = require('uuid');
const Bookmark = require('./../models/bookmark');
const {Op} = require('sequelize');
const Like = require('./../models/like');
const Friend = require('./../models/friend');

const router = express.Router();
const postImgPath = path.join(__dirname, '../../public/images/posts')
const commentImgPath = path.join(__dirname, '../../public/images/comments')

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
    {name: 'video'},
    {name: 'commentMedia', maxCount: 1},
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
        console.log(req.files.image);
        console.log(req.body.info);
        post = JSON.parse(req.body.info); // post info
        post.username = req.user.username;
        post['name'] = req.user.name;
        
        const file = req.files;
        if (file.image !== undefined) {
            console.log('if of imAGE')
            const filename = `${v4()}.png`;
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
        const bookmark = await Bookmark.getUserBookmarksIds(posts.map(post => post.postId), req.user.username)
        const likes = await Like.getUserLikeIds(posts.map(post => post.postId), req.user.username)
        const data = []

        for(let i=0; i<posts.length; i++) {
            data.push(posts[i])
            posts[i].mediaPath = process.env.TEMPURL + posts[i].mediaPath;
            posts[i].avatarPath = process.env.TEMPURL + posts[i].avatarPath;
            if (bookmark.includes(posts[i].postId)) {
                posts[i]['bookmarked'] = true
            } else {
                posts[i]['bookmarked'] = false
            }

            if (likes.includes(posts[i].postId)) {
                posts[i]['liked'] = true;
            } else {
                posts[i]['liked'] = false;
            }
        }

        res.send(data);
    } catch (e) {
        console.log(e)
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
            attributes: ['mediaPath', 'likes', 'comments', 'postId'],
            offset: skip,
            limit: limit,
        })

        if (!media) {
            throw new Error('Mentioned user has no media associated.')
        }

        for (let i=0; i<media.length; i++) {
            media[i].mediaPath = process.env.TEMPURL + media[i].mediaPath
        }

        res.send(media)
    } catch (e) {
        console.log(e)
        res.status(404).send([])
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
        const ids = await Like.getUserLikeIds(likes.map(i => i.postId), req.user.username);
        const bookIds = await Bookmark.getUserBookmarksIds(likes.map(i => i.postId), req.user.username);
        if (!likes) {
            throw new Error('Nothing found for user');
        }

        for (let i=0; i<likes.length; i++) {
            likes[i].mediaPath = process.env.TEMPURL + likes[i].mediaPath;
            likes[i].avatarPath = process.env.TEMPURL + likes[i].avatarPath;

            if (ids.includes(likes[i].postId)) {
                likes[i].liked = true;
            } else {
                likes[i].liked = false;
            }

            if (bookIds.includes(likes[i].postId)) {
                likes[i].bookmarked = true;
            } else {
                likes[i].bookmarked = false;
            }
        }
        res.send(likes);
    } catch (e) {
        res.status(404).send();
    }
})

// GET /posts/username?skip=0&limit=20
router.get('/posts/:username', optionalAuth, async (req, res) => {
    /**
     * Route for posts of a user (req.params.username)
     * 404 if no posts
     * 200 with atleast one post
     */
    let likes;
    const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit);
    try {
        const username = req.params.username;
        const posts = await Post.getUserPosts(username, skip, limit);
        if (req.user !== undefined) {
            likes = await Like.getUserLikeIds(posts.map(post => post.postId), req.user.username);
        }

        if (!posts) {
            return res.status(404).send('No Posts yet')
        }
        for (let i=0; i<posts.length; i++) {
            posts[i].mediaPath = process.env.TEMPURL + posts[i].mediaPath;
            posts[i].avatarPath = process.env.TEMPURL + posts[i].avatarPath;

            if (req.user !== undefined) {
                if (likes.includes(posts[i].postId)) {
                    posts[i]['liked'] = true
                } else {
                    posts[i]['liked'] = false
                }
            }
        }

        res.send(posts)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.post('/posts/:postId/comment', auth, mediaMiddleware, async (req, res) => {
    /**
     * Create comment reference to parent id
     * 201 for success
     * 400 for failure
     */
    try {
        const post = await Post.findOne({where: {postId: req.params.postId}});
        if (!post) {
            throw new Error('Invalid request')
        }

        const raw = JSON.parse(req.body.info);

        const commentBody = {
            replyTo: post.postId,
            username: req.user.username,
            description: raw.commentValue,
            type: 'reply',
            mediaPath: undefined,
            mediaIncluded: false,
        }


        const file = req.files;
        if (file.commentMedia !== undefined) {
            console.log('if of imAGE')
            const filename = `${v4()}.png`;
            const filePath = commentImgPath + '/' + filename;
            await sharp(file.commentMedia[0].buffer).png().toFile(filePath);
            commentBody['mediaPath'] = '/images/comments/' + filename;
            commentBody['mediaIncluded'] = true;    
        }

        const comment = await Post.comment(commentBody);

        res.status(201).send({comment});
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
})

// GET /posts/postid/comment?skip=0&limit=10
router.get('/posts/:postId/comment', auth, async (req, res) => {
    /**
     * Get comment of specified post
     * 201 for success
     * 500 for failure
     */
    const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit);
    try {
        const comments = await Post.getComments(req.params.postId, skip, limit);
        for (i=0; i<comments.length; i++) {
            comments[i].avatarPath = process.env.TEMPURL + comments[i].avatarPath;
            comments[i].mediaPath = process.env.TEMPURL + comments[i].mediaPath; 
        }
        res.send(comments);
    } catch (e) {
        console.log(e)
        res.status(500).send();
    }
})

router.patch('/posts/:postId/like', auth, async (req, res) => {
    /**
     * Update like insert 1 if not present, delete if present
     * 200 for insertion
     * 400 for deletion
     */
    try {
        const didExists = await Post.findOne({where: {postId: req.params.postId}})
        if (!didExists) {
            throw new Error('Invalid request');
        }

        const isPresent = await Like.findOne({where: {
                postId: req.params.postId, 
                likedBy: req.body.username, 
                postedBy: req.body.postedBy
            }
        })

        if (isPresent) {
            throw new Error('Present')
        }

        const likes = await Post.like(req.params.postId, req.body.username, req.body.postedBy);
        res.send({likes});
    } catch (e) {
        if (e.toString() === 'Error: Present') {
            await Like.destroy({where: {
                postId: req.params.postId, 
                likedBy: req.body.username, 
                postedBy: req.body.postedBy
            }})
            Post.increment({likes: -1}, {where: {postId: req.params.postId}})
        }
        const likes = await Like.count({where: {postId: req.params.postId}})
        res.status(400).send({likes})
    }
})


//Get /posts/uuid4/stargazers?skip=0&limit=20
router.get('/posts/:postId/stargazers', auth, async (req, res) => {
    /**
     * Get users who liked a specific post
     * 200 for successfull retrieval
     * 500 for errors
     */
    const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit);
    try {
        const stargazers = await Like.getStarGazers(req.params.postId, skip, limit);
        const isFollowing = await Friend.findAll({
            where: {
                username: req.user.username,
                followed_username: {
                    [Op.in]: stargazers.map(user => user.username)
                }
            },
            attributes: ['followed_username'],
            raw: true,
        }).map(follo => follo.followed_username);
        const follows_you = await Friend.findAll({
            where: {
                username: {
                    [Op.in]: stargazers.map(user => user.username)
                },
                followed_username: req.user.username
            },
            attributes: ['username'],
            raw: true,
        }).map(follo => follo.username);

        for (let i = 0; i < stargazers.length; i++) {
            stargazers[i]['avatarPath'] = process.env.TEMPURL + stargazers[i]['avatarPath'];

            if (isFollowing.includes(stargazers[i]['username'])) {
                stargazers[i]['isFollowing'] = true;
            } else {
                stargazers[i]['isFollowing'] = false;
            }

            if (follows_you.includes(stargazers[i]['username'])) {
                stargazers[i]['follows_you'] = true;
            } else {
                stargazers[i]['follows_you'] = false;
            }
        }
        res.send(stargazers);
    } catch (e) {
        console.log(e)
        res.status(500).send();
    }
})

router.get('/posts/trends/:username', auth, (req, res) => {
    res.send('coming soon');
})

module.exports = router;