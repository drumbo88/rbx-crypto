import Vue from 'vue'
import App from './App.vue'

import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:4000/api'
axios.defaults.withCredentials = true
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

import vuetify from './plugins/vuetify';
import router from './router/index';
import store from './store'

import 'element-ui/lib/theme-chalk/index.css'
Vue.use(require('element-ui'))

Vue.use(require('vue-moment'))

import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import HighchartsData from 'highcharts/modules/data'
import HighchartsStock from 'highcharts/modules/stock'
HighchartsData(Highcharts)
HighchartsStock(Highcharts)

Highcharts.setOptions({
    chart: {
        backgroundColor: {
            linearGradient: [0, 0, 500, 500],
            stops: [
                [0, 'rgb(100, 100, 100)'],
                [1, 'rgb(20, 20, 20)']
            ]
        },
    },
    title: {
        style: {
            color: '#eee'
        }
    },

    subtitle: {
        style: {
            color: '#eee'
        }
    },
    xAxis: {
        labels: {
            style: {
                color: '#eee'
            }
        }
    },
    yAxis: {
        title: { // Texto eje Y
            style: {
                color: '#eee'
            }
        },
        labels: { // Valores eje Y
            style: {
                color: '#eee'
            }
        },
        stackLabels: { // Valor arriba de una pila
            style: { 
                color: '#eee',
                fontWeight: 'normal', textAlign: 'center' 
            },
        }
    },
    plotOptions: {
        column: {
            label: { // ?
                style: { 
                    color: '#33f',
                },
            },
            dataLabels: { // Valor arriba de una columna (no pila)
                style: { 
                    color: '#eee',
                    fontWeight: 'normal', 
                },
            },
        },
        candlestick: {
            color: '#ff3333',
            lineColor: '#dd2222',
            upColor: '#33ff33',
            upLineColor: '#22dd22',
        }
    },
    credits: {
        text: 'RBX-Crypto'
    },
})
Vue.use(HighchartsVue, {
    highcharts: Highcharts
})

new Vue({
    vuetify,
    router, store,
    render: h => h(App),
    beforeCreate() {
        let user = localStorage.getItem('authUser')
        if (user) {
            user = JSON.parse(user)
            this.$store.commit('users/SET_USER', user)
        }
        //axios.interceptors.request.use(() => {
            if(user && user.authToken) {
                axios.defaults.headers.common['auth-token'] = `Bearer ${user.authToken}`;
            } else {
                delete axios.defaults.headers.common['auth-token'];
            }
        //})
        axios.interceptors.response.use(
            response => {
                if (response.data.error)
                    console.log("vvvvv",response.data.error,"^^^^^")
                return response
            },
            error => {
                console.error("#####"+error+"#####")
                if (error.response.status === 401) {
                    this.$store.dispatch('logout')
                }
                return Promise.reject(error)
            }
        )
    }
}).$mount('#app')
  
