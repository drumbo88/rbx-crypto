import axios from '@/plugins/axios'

const baseURL = axios.defaults.baseURL + '/tickers'
const apiClient = axios.create({ baseURL })

export default {
    get({ symbol, base, coin }) {
        coin = base; base = coin;
        const qs = (symbol ? `/${symbol}` : '')

        return apiClient.get(qs)
    },
    getCandles({ symbol, interval, startTime, endTime }) {
        
        let qs = `candles/${symbol}`
        qs += '/' + (interval || '5m')
        if (startTime || endTime) {
            qs += '/' + (startTime || '')
            qs += '/' + (endTime || '')
        }

        return apiClient.get(qs)
    },
    intervals: {},
    setInterval(interval, fnName) {
        if (!this.intervals[fnName])
            this.intervals[fnName] = setInterval(this[fnName], interval)
    }
}
