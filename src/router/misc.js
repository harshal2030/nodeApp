const express = require('express');
const Bookmark = require('./../models/bookmark');
const auth = require('./../middlewares/auth');
const router = express.Router();

// POST /misc?option=bookmark
router.post('/misc', auth, async (req, res) => {
    /**
     * Route for adding misc to database
     * 201 for success, bookmark registered
     * 403 for removal, bookmark removed
     * 
     * ?options=
     * 1. bookmark = gem on frontend, save fav posts
     */
    try {
        if (req.query.option === 'bookmark') { // algo for bookmarks
            const bookmarkAdded = await Bookmark.addBookmark(req.user.username, req.body.postId)
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

// GET /posts/misc?option=bookmark&skip=0&limit=20
router.get('/misc', auth, async (req, res) => {
    /**
     * Route to fetch user misc posts
     * 200 success
     */
    const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip);
    const limit = req.query.limit === undefined ? 20 : parseInt(req.query.limit);
    try {
        if (req.query.option === 'bookmark') {
            const bookmarks = await Bookmark.getUserBookmarks(req.user.username, skip, limit);
            for (let i=0; i<bookmarks.length; i++) {
                bookmarks[i].mediaPath = process.env.TEMPURL + bookmarks[i].mediaPath;
                bookmarks[i].avatarPath = process.env.TEMPURL + bookmarks[i].avatarPath;
                bookmarks[i].bookmarked = true;
            }
            res.send(bookmarks);
        }
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router;