import Vue from 'vue'
import App from './App.vue'

//import router from './router'
//import Vuetify from 'vuetify/lib/framework';
import vuetify from './plugins/vuetify';
import router from './router/index';
import { store } from './store'
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'

//createApp(App).mount('#app')
import AppAlert from './components/Shared/Alert.vue'
Vue.component('app-alert', AppAlert)
Vue.use(require('vue-moment'))
Vue.use(Highcharts)
Vue.use(HighchartsVue)

new Vue({
    vuetify,
    router, store,
    render: h => h(App)
}).$mount('#app')
  
