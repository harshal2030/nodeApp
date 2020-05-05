const express = require('express');
const Post = require('./../models/post');
const {auth} = require('./../middlewares/auth');
const {publicPath} = require('./../utils/paths');
const sharp = require('sharp');
const fs = require('fs');

const router = express.Router();

router.get('/posts/:postId/images', auth, async (req, res) => {
    try {
        const post = await Post.findOne({
            where: {
                postId: req.params.postId
            },
            attributes: ['mediaPath']
        })

        if (!post) {
            throw new Error('No such post')
        }

        const imagePath = publicPath + post.mediaPath;
        const image = await sharp(imagePath).webp({lossless: false}).toBuffer()

        res.set({'Content-Type': 'image/webp'}).send(image)
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
})

router.get('/posts/:postId/video', auth, async (req, res) => {
    try {
        const post = await Post.findOne({
            where: {
                postId: req.params.postId
            },
            attributes: ['mediaPath']
        });

        if (!videoMp4Pattern.test(post.mediaPath)) {
            throw new Error('No video associated');
        }

        const path = publicPath + post.mediaPath;
        const stat = fs.statSync(path);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunkSize = (end - start) + 1;
            const file = fs.createReadStream(path, { start, end });

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    } catch (e) {
        res.sendStatus(400)
    }
})

module.exports = router;
