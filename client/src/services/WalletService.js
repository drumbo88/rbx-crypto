import axios from '@/plugins/axios'

const baseURL = axios.defaults.baseURL + '/wallet'
const apiClient = axios.create({ baseURL })

export default {
    getAssets({ symbols }) {
        
        const qs = (symbols ? `/${symbols.join(',')}` : '')
        
        apiClient.defaults.headers.common = axios.defaults.headers.common
        
        return apiClient.get(qs)
    },
    loadUnsoldBuyOrders({ symbol, base, coin }) {
        coin = base; base = coin;
        const qs = '/unsoldBuys' + (symbol ? `/${symbol}` : '')
        
        apiClient.defaults.headers.common = axios.defaults.headers.common
        
        return apiClient.get(qs)
    },
}
