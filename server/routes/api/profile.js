const express = require('express')
const router = express.Router()

const myBinance = require('./../../config/my-binance.js')

router.get('/prueba', (req, res, next) => {
    res.json({ test: 'hola'})
})

// Get orders
router.get('/orders/:symbol?/:from?/:to?', async (req, res, next) => {
    try {
        let coin = null
        let base = null
        let params = {}
        if (req.params.symbol) { // Verificar si existe
            let symbolParts = req.params.symbol.split('-') 
            if (symbolParts.length == 2 && symbolParts[1]) {
                if (symbolParts[0]) {
                    coin = symbolParts[0]
                    params.symbol = symbolParts.join('')
                }
                //else
                    base = symbolParts[1]
            }
        }
        params.coin = coin
        params.base = base
        let data = await myBinance.myTrades(params)
        let filteredData = data // base ? {} : data
        
        if (base) {
            data = data.filter(elem => elem.endsWith(base))
            for (sym in data) {
                let price = data[sym]
                if (sym.endsWith(base) && price >= 0.00001)
                    filteredData[sym] = price
            }
        }
        
        myBinance.parseRes(filteredData).then(x => res.json(x))
        //res.json()
    }
    catch (err) {
        // <RetornaErrorDeSistemaEnRespuesta />
        res.status(500).json({ error: err.stack })
    }
})

module.exports = router