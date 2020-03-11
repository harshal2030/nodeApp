const express = require('express');
const auth = require('./../middlewares/auth');
const Post = require('./../models/posts');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const uuidv4 = require('uuid/v4')

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

router.post('/posts', auth, upload.single('image'), async (req, res) => {
    post = JSON.parse(req.body.info);
    post.username = req.user.username;
    post['name'] = req.user.name;

    if (req.file !== undefined) {
        const filename = `${uuidv4()}.png`;
        const filePath = postImgPath + '/' + filename;
        await sharp(req.file.buffer).png().toFile(filePath);
        post['mediaPath'] = filePath;
        post['mediaIncluded'] = true;    
    }
    console.log(post)

    await Post.create(post);
    res.status(201).send()
})

router.get('/posts/:username', async (req, res) => {
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