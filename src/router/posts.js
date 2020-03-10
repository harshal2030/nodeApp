const express = require('express');
const auth = require('./../middlewares/auth');

const router = express.Router();

router.post('/posts', auth, (req, res) => {
    res.send(req.body)
})

module.exports = router;