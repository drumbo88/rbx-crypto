import axios from '@/plugins/axios'

const baseURL = axios.defaults.baseURL + '/Auth'
const apiClient = axios.create({ baseURL })

export default {
    signIn(params) {
        return apiClient.post('signIn', params.payload)
    },
    signUp(params) {
        return apiClient.post('signUp', params.payload)
    },
    /*signOut() {
        return apiClient.get('signOut')
    },*/
}
