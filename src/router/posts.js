const express = require('express');
const auth = require('./../middlewares/auth');
const Post = require('./../models/post');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const router = express.Router();
const postImgPath = path.join(__dirname, '../../public/images/posts')
const postVideoPath = path.join(__dirname, './../../public/videos/posts')

const upload = multer({
    limits: {
        fileSize: 200 * 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|mp4|mkv)$/)) {
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
    try {
        post = JSON.parse(req.body.info);
        post.username = req.user.username;
        post['name'] = req.user.name;
        
        const file = req.files;
        console.log(file.video);
        if (file.image[0] !== undefined) {
            const filename = `${uuidv4()}.png`;
            const filePath = postImgPath + '/' + filename;
            await sharp(file.image[0].buffer).png().toFile(filePath);
            post['mediaPath'] = filePath;
            post['mediaIncluded'] = true;    
        } else if (file.video[0] !== undefined) {
            stream = fs.createWriteStream('steam.divx')
            const filename = `${uuidv4()}.mp4`
            const filePath = postVideoPath + '/' +filename;
            await ffmpeg(file.video[0].buffer).output(filePath).output(stream)
            post['mediaPath'] = filePath;
            post['mediaIncluded'] = true; 
        }

        console.log(post)
    
        await Post.create(post);
        res.status(201).send()
    } catch(e) {
        res.status(400).send(e)
    }
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