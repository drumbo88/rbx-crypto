const express = require('express')
const router = express.Router()

const initMyBinance = require('../../config/my-binance')
initMyBinance().then(myBinance => {
    // Get Prices
    router.get('/orders/:symbol?/:status?', async (req, res, next) => {
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
            let data = await myBinance.myFilledTrades(params)
            let filteredData = data // base ? {} : data
            /*
            if (base) for (sym in data) {
                let price = data[sym]
                if (sym.endsWith(base) && price >= 0.00001)
                    filteredData[sym] = price
            }*/
            //data = data.filter(elem => elem.endsWith(base))
            
            myBinance.parseRes(filteredData).then(x => res.json(x))
            //res.json()
        }
        catch (err) {
            res.send(err+"\n\n"+JSON.stringify(myBinance))
        }
    })

})

module.exports = router