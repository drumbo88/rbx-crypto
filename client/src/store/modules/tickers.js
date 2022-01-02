import tickersService from '@/services/TickersService';
import useCommiter from '@/composables/use-commiter';

import Symbol from '@/models/symbol';

export const namespaced = true

export const actions = {
    
    async get({commit, state}, { symbol }) {
        
        const __FUNCTION__ = 'tickers/get'
        
        return useCommiter(__FUNCTION__, () => {

            return tickersService.get({ symbol }).then(response => {
                
                //let times = Object.keys(state.prices)
                //vue.lastTime = times.length ? times[times.length - 1] : null
                //if (!times.length) setInterval(() => { state.firstTime = ''; state.firstTime = currentTime }, 1000)
                let currentTime = response.data.time
                
                let lastPrices = state.prices[currentTime] = []
                let prices = response.data.data.prices
                let volatilities = response.data.data.volatilities
                
                for (let symbol in prices) {
                    let price = parseFloat(prices[symbol])
                    //if (price < 0.000001) continue
                    let symbolObj = new Symbol({ symbol })
                    symbolObj.setPrice(price, currentTime)
                    lastPrices.push(symbolObj)
                }
                //console.log(lastPrices)
                
                commit('SET_PRICES', { 
                    prices: lastPrices, 
                    volatilities: volatilities, 
                    time: currentTime 
                })

                return response
            })
        })
    },
    async getCandles({commit}, { symbol, interval, startTime, endTime }) {
        
        const __FUNCTION__ = 'tickers/getCandles'
        
        return useCommiter(__FUNCTION__, () => {

            return tickersService.getCandles({ symbol, interval, startTime, endTime })
            .then(response => {
                
                let currentTime = response.data.time
                let candles = []

                for (let candle of response.data.data.candles)
                    candles.push([
                        parseInt(candle.openTime),
                        parseFloat(candle.open),
                        parseFloat(candle.high),
                        parseFloat(candle.low),
                        parseFloat(candle.close),
                    ])

                commit('SET_CANDLES', { 
                    symbol: symbol, 
                    interval: interval, 
                    candles: candles, 
                    time: currentTime 
                })

                return response
            })
        })
    },
    getPeriodically({ dispatch }, { interval, symbol }) {
        //if (!interval)
          //  throw new Error("Falta especificar intervalo de tiempo.")

        setInterval(() => {
            try { return dispatch('get', { symbol }) }
            catch (error) { return error }
        }, interval)
    },
    // ...('ADA', 10) = 
    getPriceInUSD(coin, value) {
        if (!value)
            value = 1

        for (let usdCoin of this.usdCoins) 
        {
            let price = this.getPrice(coin + usdCoin) //2.28
            if (price)
                return value * price // 22.8
        }
        for (let mainCoin of this.mainCoins) 
        {
            let priceInMain = this.getPriceInUSD(mainCoin)
            if (priceInMain) // 48000 | 10 * 48000 * 2.28/48000
                return priceInMain * this.getPrice(coin + mainCoin, value)
        }        
    }
}

export const state = {
    currency: 'USDT',
    usdCoins: ['USDT','BUSD'],
    mainCoins: ['BTC','ETH'],
    prices: {},
    candles: {},
    volatilities: [],
    firstTime: null,
    lastTime: null,
}

export const mutations = {
    SET_PRICES (state, { time, prices, volatilities }) {
        state.prices[time] = prices
        state.volatilities = volatilities
        state.lastTime = time
        console.log(`Precios actualizados (${new Date(time).toLocaleString()})`)
    },
    SET_CANDLES (state, { time, symbol, candles /*, interval, startTime, endTime*/ }) {
        state.candles[symbol] = candles
        //state.lastTime = time
        console.log(`Velas de ${symbol} actualizadas (${new Date(time).toLocaleString()})`)
    },
}

export const getters = {
    getSymbol: (state, getters) => (symbol, time) => { // Retorna symbolObj en time o más reciente
        return getters.getPrices(time)
            .find(symObj => symObj.symbol == symbol)
    },
    getPrices: state => time => {
        time = time || state.lastTime
        return time ? state.prices[time] : []
    }, 
    getPrice: (state, getters) => (symbol, time) => { // Retorna el precio de symbolObj en time o más reciente
        let symbolObj = getters.getSymbol(symbol, time)
        //console.log((time || state.lastTime),'>>>', symbol, symbolObj)
        return symbolObj ? symbolObj.price : null
    },
    candles: (state) => (symbol) => { 
        return state.candles[symbol]
    },
    getVolatilities: state => {
        return state.volatilities
    }, 
    getCurrency: state => currency => currency ? currency : state.currency,
    getCurrencyPrice: (state, getters) => currency => getters.getPrice('BTC' + getters.getCurrency(currency)) || 0,
}