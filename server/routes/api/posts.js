const express = require('express')
//const mongoose = require('mongoose')

const router = express.Router()

// Get Posts
router.get('/', (req, res) => {
    res.send('hello')
})

// Add Post

// Delete Post

module.exports = router