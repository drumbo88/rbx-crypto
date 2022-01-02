const express = require('express')
const myBinance = require('./../../config/my-binance.js')
const router = express.Router()

// Get Top 10 X min pairs of a Market (def: BTC)
router.get('/top10/:mins/:market?', async (req, res, next) => {
    try {
        let data = await myBinance.api.candles({ symbol: req.params.pair })
        res.send(data)
    }
    catch (err) {
        myBinance.error = err
        myBinance.error.message = String(err)
        res.send(JSON.stringify(myBinance))
    }
})


// Get Candles
router.get('/candles/:symbol/:interval?/:startTime?/:endTime?/', async (req, res, next) => {
    try {
        let base = null
        let params = req.params
        if (req.params.symbol) { // Verificar si existe
            let symbolParts = req.params.symbol.split('-') 
            if (symbolParts.length == 2 && symbolParts[1]) {
                if (symbolParts[0])
                    params.symbol = symbolParts.join('')
                else
                    base = symbolParts[1]
            }
        }
        if (!params.interval)
            params.interval = '5m'
        if (!params.startTime)
            delete params.startTime
        if (!params.endTime)
            delete params.endTime
        
        let data = {
            candles: await myBinance.getCandles(params),
        }
        let filteredData = data //base ? {} : data

        /*if (base) for (sym in data) {
            let price = data[sym]
            if (sym.endsWith(base) && price >= 0.00001)
                filteredData[sym] = price
        }*/
        //data = data.filter(elem => elem.endsWith(base))
        myBinance.parseRes(filteredData)
            .then(x => res.send(x))
        //res.json()
    }
    catch (err) {
        myBinance.error = err
        myBinance.error.message = err.toString()
        res.send(JSON.stringify(myBinance))
    }
})

// Get Prices
router.get('/:symbol?', async (req, res, next) => {
    try {
        let base = null
        let params = {}
        if (req.params.symbol) { // Verificar si existe
            let symbolParts = req.params.symbol.split('-') 
            if (symbolParts.length == 2 && symbolParts[1]) {
                if (symbolParts[0])
                    params.symbol = symbolParts.join('')
                else
                    base = symbolParts[1]
            }
        }
        let data = {
            prices: await myBinance.getPrices(params),
            volatilities: await myBinance.getVolatilities(params)
        }
        let filteredData = data //base ? {} : data

        /*if (base) for (sym in data) {
            let price = data[sym]
            if (sym.endsWith(base) && price >= 0.00001)
                filteredData[sym] = price
        }*/
        //data = data.filter(elem => elem.endsWith(base))
        myBinance.parseRes(filteredData)
            .then(x => res.send(x))
        //res.json()
    }
    catch (err) {
        myBinance.error = err
        myBinance.error.message = String(err)
        res.send(JSON.stringify(myBinance))
    }
})

module.exports = router