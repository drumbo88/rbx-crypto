const express = require('express')
const router = express.Router()

const binance = require('../../config/my-binance')

// Get Trades
router.get('/:pair', async (req, res, next) => {
    try {
        let data = await binance.api.candles({ symbol: req.params.pair })
        res.send(data)
    }
    catch (err) {
        res.send("+"+JSON.stringify(binance))
    }
})

// Get Top 10 X min pairs of a Market (def: BTC)
router.get('/top10/:mins/:market?', async (req, res, next) => {
    try {
        let data = await binance.api.candles({ symbol: req.params.pair })
        res.send(data)
    }
    catch (err) {
        res.send("+"+JSON.stringify(binance))
    }
})

// Add Post

// Delete Post

module.exports = router