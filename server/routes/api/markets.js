const express = require('express')
const router = express.Router()

const initMyBinance = require('../../config/my-binance')
initMyBinance().then(myBinance => {
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
            let data = await myBinance.api.prices(params)
            let filteredData = base ? {} : data

            if (base) for (sym in data) {
                let price = data[sym]
                if (sym.endsWith(base) && price >= 0.00001)
                    filteredData[sym] = price
            }
            //data = data.filter(elem => elem.endsWith(base))
            
            myBinance.parseRes(filteredData).then(x => res.json(x))
            //res.json()
        }
        catch (err) {
            res.send(err+"\n\n"+JSON.stringify(myBinance))
        }
    })

    // Get Top 10 X min pairs of a Market (def: BTC)
    router.get('/top10/:mins/:market?', async (req, res, next) => {
        try {
            let data = await myBinance.api.candles({ symbol: req.params.pair })
            res.send(data)
        }
        catch (err) {
            res.send("+"+JSON.stringify(myBinance))
        }
    })

})

module.exports = router