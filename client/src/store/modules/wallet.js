import walletService from '@/services/WalletService.js'
import useCommiter from '@/composables/use-commiter.js'

export const namespaced = true

export const actions = {

    async getAssets({ commit }, { symbol }) 
    {
        const __FUNCTION__ = 'wallet/getAssets'

        let promise = useCommiter(__FUNCTION__, () => {
            return walletService.getAssets({ symbol }).then(response => {

                let assets = []
                for (let asset of response.data.data.assets) {
                    assets.push({ name: asset.name, quantity: asset.quantity })
                }

                commit('SET_ASSETS', { assets, symbol })
            })
        })

        return promise
    },
    async loadUnsoldBuyOrders({ commit }, { symbol }) 
    {
        const __FUNCTION__ = 'wallet/loadUnsoldBuyOrders'

        let promise = useCommiter(__FUNCTION__, () => {
            return walletService.loadUnsoldBuyOrders({ symbol }).then(response => {
                let /*qtyBuys = 0, qtySells = 0, */coins = [], coinsObjs = [], coinObj
                const _USDT = response.data._USDT 
                
                // Recorro las órdenes
                for (let order of response.data.data) 
                {
                    let base = ''
                    if (order.symbol == 'BTCUSDT')
                        base = 'USDT'
                    else if (order.symbol.endsWith('USDT')) 
                        base = 'USDT'
                    else
                        continue
                    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Para que solo vea XXXBTC

                    let coin = order.symbol.slice(0, -(base.length)) // quito BASE del final
                    let posCoin = coins.indexOf(coin)
                    if (posCoin == -1) {
                        posCoin = coins.length
                        coins.push(coin)
                        coinObj = {
                            name: coin,
                            totalBTC: 0,
                            buys: [],
                            qtyBuys: 0,
                            qtySells: 0,
                            price: coin == 'USDT' ? 1 : order.price,
                            quantity: 0,
                        }
                        coinsObjs.push(coinObj)
                    }
                    else coinObj = coinsObjs[posCoin]

                    // Las compras, las agrego
                    let debugTrades = coinObj.name == '' //'BQX' 
                    let debugBTC = coinObj.name == '' //'BQX' 

                    if (order.side == 'BUY') {
                        coinObj.qtyBuys++
                        coinObj.totalBTC -= order.totalPrice
                        order.quantity = parseFloat(order.quantity)
                        if (debugTrades) console.log("CMP",order.quantity)
                        if (debugBTC) { console.log("CMP",order.totalPrice, coinObj.totalBTC) }
                        order._quantity = order.quantity
                        coinObj.quantity += order.quantity
                        coinObj.buys.push(order)
                    } else { // Las ventas, las uso para descontar lo comprado
                        coinObj.qtySells++
                        coinObj.quantity -= order.quantity
                        coinObj.totalBTC += order.totalPrice
                        if (debugBTC) { console.log("VTA",order.totalPrice, coinObj.totalBTC) }
                        coinObj.sellQuantity = order.quantity
                        for (let i=coinObj.buys.length - 1; coinObj.sellQuantity > 0 && i>=0; i--) {
                            if (i == coinObj.buys.length - 1)
                                order._quantity = coinObj.quantity;
                            let buyOrder = coinObj.buys[i], qtyDif = coinObj.sellQuantity - buyOrder.quantity
                            let usdDif = qtyDif * order.price * _USDT
                            // Si vende todo lo que queda de la compra, quita la compra. Sino, descuenta la parte
                            if (usdDif >= 0 /*>= -5*/) {
                                coinObj.sellQuantity = qtyDif
                                if (debugTrades) console.log("VTA-TOTAL",buyOrder.quantity,coinObj.sellQuantity,usdDif,usdDif<0)
                                coinObj.buys.pop()
                            } 
                            else {
                                if (debugTrades) console.log("VTA",buyOrder.quantity,'-',coinObj.sellQuantity, '=',buyOrder.quantity - coinObj.sellQuantity)
                                buyOrder.quantity -= coinObj.sellQuantity
                                order.quantity = coinObj.sellQuantity = 0;
                            }
                        }
                    }
                }
                let totalBalanceBTC = 0
                for (let i=0; i<coinsObjs.length; i++) {
                    /*console.log(`COIN: ${coinsObjs[i].name}`)
                    console.log(`BTC: ${coinsObjs[i].totalBTC}`)
                    /*console.log(`BUYS: ${coinsObjs[i].qtyBuys}`)
                    console.log(`SELLS: ${coinsObjs[i].qtySells}`)
                    console.log(`REM: ${coinsObjs[i].buys.length}`)*/
                    //console.log(coinsObjs[i].name,coinsObjs[i].quantity , coinsObjs[i].price,'=',coinsObjs[i].quantity * coinsObjs[i].price)
                    totalBalanceBTC += coinsObjs[i].quantity * coinsObjs[i].price
                }

                commit('SET_UNSOLD_BUY_ORDERS', { 
                    data: coinsObjs, 
                    totalBalanceBTC,
                    //qtyBuys, qtySells,
                })
            })
        })

        return promise
    },

} 

export const state = {
    assets: [],
    unsoldBuyOrders: [],
    totalBalanceBTC: 0,
}

export const mutations = {
    SET_ASSETS (state, { assets }) {
        state.assets = assets
    },
    SET_UNSOLD_BUY_ORDERS (state, payload) {
        state.unsoldBuyOrders = payload.data
        state.totalBalanceBTC = payload.totalBalanceBTC
    },
}

export const getters = {

    // Agrega precios actualizados a los assets
    getAssetsPrices: (state, getters, rootState, rootGetters) => (currency) => {
        if (!currency)
            currency = 'USDT'
        let btcChange = (currency == 'BTC') ? 1 : rootGetters['tickers/getPrice']('BTC'+currency) || 1

        return state.assets.map(asset => { 
            let price = 1
            if (asset.name != currency) {
                price = rootGetters['tickers/getPrice'](asset.name + currency)
                if (price === null || isNaN(price))
                    price = rootGetters['tickers/getPrice'](asset.name + 'BTC') * btcChange
                price = isNaN(price) ? 0 : price
            }
            return { ...asset, price, total: asset.quantity * price }
        })
    },
    getTotalBalance: (state, getters) => (currency) => {
        let total = 0
        getters.getAssetsPrices(currency).forEach(asset => { total += asset.total })
        return total
    },
    totalBalanceBTC: (state, getters) => {
        return getters.getTotalBalance('BTC')
    },
    totalBalanceUSDT: (state, getters) => {
        return getters.getTotalBalance('USDT')
    },
    assets: (state) => state.assets,
    getUnsoldBuyOrders: state => (/*symbol*/) => {
        return state.unsoldBuyOrders
    }, 
}