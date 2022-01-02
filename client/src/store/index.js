import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

// Modules
import * as users from './modules/users';
import * as symbols from './modules/symbols';

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        users, symbols, ...symbols.modules
    },
    state: {
        promises: {},
        balance: [],
        totalBalanceBTC: 0,
        buyOrders: [],
        loadedMeetups: [],
        loading: false,
        error: null,
        systemError: null,
    },
    actions: {
        async loadBuysList({commit, state}, { symbol }) 
        {
            const __FUNCTION__ = 'loadBuysList'

            if (state.promises[__FUNCTION__])
                return state.promises[__FUNCTION__]
            
            let from = null, to = null
			const API_GET_PROFILE_ORDERS = process.env.VUE_APP_API_URL + `/profile/orders${symbol ? '/'+symbol : ''}${from ? '/'+from : ''}${to ? '/'+to : ''}`

            let promise = axios.get(API_GET_PROFILE_ORDERS)
                .then(response => {
                    let /*qtyBuys = 0, qtySells = 0, */coins = [], coinsObjs = [], coinObj
                    const _USDT = response.data._USDT 
                    
                    for (let order of response.data.data) 
                    {
                        let base = ''
                        if (order.symbol == 'BTCUSDT')
                            base = 'USDT'
                        else if (order.symbol.endsWith('BTC')) 
                            base = 'BTC'
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
                                price: coin == 'BTC' ? 1 : order.price,
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
                                    //coinObj.buys.pop()
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
                    this.totalBalanceBTC = totalBalanceBTC
                    commit('SET_ORDERS', { data: coinsObjs })
                })
                .catch(error => {
                    //console.log(error)
                    //commit('CONSOLE_ERROR', API_GET_PROFILE_ORDERS +"\n"+error.stack)
                    console.error(error.stack)
                })
                .finally(() => {
                    // commit('CLEAR_PROMISE', __FUNCTION__)
                    //commit('SET_LOADING', false)
                })

            commit('SET_PROMISE', { promise, action: __FUNCTION__ })
            return promise
        },
        clearSystemError ({commit}) {
            commit('CLEAR_SYSTEM_ERROR')
        },
    },    
    mutations: {
        SET_PROMISE (state, payload) {
            if (payload.promise) {
                console.log(`[${payload.action}] Cargando...`)
                state.loading = true
                state.promises[payload.action] = payload.promise
            }
        },
        CLEAR_PROMISE (state, { action }) {
            console.log(`[${action}] Finalizado.`)
            state.loading = false
            state.error = null
            delete state.promises[action]
        },
        CONSOLE_ERROR (state, payload) {
            console.log("vvvvvvvvvv ERROR vvvvvvvvvv", payload, "^^^^^^^^^^^^^^^^^^^^^^^^^^")
        },
        SET_ORDERS (state, payload) {
            state.orders = payload.data
            //state.totalBalanceBTC = payload.totalBalanceBTC
        },
        SET_ERROR (state, error) {
            if (error.response) {
                const errStatus = error.response.status
                if (errStatus >= 500) {
                    state.systemError = error
                    console.error(error)
                }
                else //if (errStatus >= 400) ...
                    state.error = error
            }
            else state.error = error
        },
/*        CLEAR_SYSTEM_ERROR (state) {
            state.systemError = null
        },*/
    },
    getters: {
        getBuysList: state => (/*symbol*/) => {
            return state.orders
        }, 
        loading (state) { return state.loading },
        error (state) { return state.error },
        systemError (state) { return state.systemError },
    }
})