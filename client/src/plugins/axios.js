import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:4000/api'
axios.defaults.withCredentials = true
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

export default axios
/*const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

axiosInstance.interceptors.request.use((config) => {
    config.headers.common['auth-token'] = `Bearer ${user.authToken}`
})*/