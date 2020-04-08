const express = require('express')
const {auth} = require('./../middlewares/auth')
const User = require('./../models/user')
const multer = require('multer');
const path = require('path');
const sharp = require('sharp')
const fs = require('fs')
const {v4} = require('uuid')

const router = express.Router();

const avatarPath = path.join(__dirname, '../../public/images/avatar');
const headerPath = path.join(__dirname, '../../public/images/header');

const publicPath = path.join(__dirname, '../../public');

const upload = multer({
    limits: {
        fileSize: 5 * 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(Error("Unsupported files uploaded to the server"))
        }

        cb(undefined, true)
    }
})

const mediaMiddleware = upload.fields([
    {name: 'avatar', maxCount: 1},
    {name: 'header', maxCount: 1}
])

router.put('/settings/profile', mediaMiddleware, auth, async (req, res) => {

    const userUpdate = JSON.parse(req.body.info);
    const updates = Object.keys(userUpdate);
    const allowedUpdates = ['name', 'bio', 'location', 'website', 'dob'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Bad request parameters" })
    }

    try {

        const user = req.user;
        updates.forEach(update => user[update] = userUpdate[update]);

        const files = req.files;
        if (files.avatar !== undefined) {

            if (fs.existsSync(`${publicPath}/${req.user.avatarPath}`) 
                && req.user.avatarPath !== '/images/avatar/default.png') {
                fs.unlinkSync(`${publicPath}/${req.user.avatarPath}`);
            }

            const fileName = `${v4()}.png`
            const filePath=`${avatarPath}/${fileName}`;
            await sharp(files.avatar[0].buffer).png().toFile(filePath);
            user.avatarPath = `/images/avatar/${fileName}`;
        }

        if (files.header !== undefined) {

            if (fs.existsSync(`${publicPath}/${req.user.headerPhoto}`)) {
                fs.unlinkSync(`${publicPath}/${req.user.headerPhoto}`);
            }

            const fileName = `${v4()}.png`
            const filePath=`${headerPath}/${fileName}`;
            await sharp(files.header[0].buffer).png().toFile(filePath);
            user.headerPhoto = `/images/header/${fileName}`;
        }

        await User.update(user, {
            where: {
                username: req.user.username,
            }
        })

        user.avatarPath = process.env.TEMPURL + user.avatarPath;
        user.headerPhoto = process.env.TEMPURL + user.headerPhoto;
        res.send();
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }
})

module.exports = router;