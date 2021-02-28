<template>
  <div class="home">
    <input type="text" v-model="coin" style="border: 1px inset black; background: yellow" />
    <MarketTopChanges mins="0.5" :coin="ucCoin" base="BTC" />
    <Buys />
    <SignUp msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import Buys from '@/components/Buys.vue'
import SignUp from '@/components/Users/SignUp.vue'
import MarketTopChanges from '@/components/MarketTopChanges.vue'
//import TradeChart from '@/components/TradeChart.vue'

export default {
  name: 'SignUpView',
  data() {
    return {
      coin: ''
    }
  },
  components: {
    SignUp, MarketTopChanges, Buys
  },
  computed: {
    ucCoin() { return this.coin.toUpperCase() }
  }
}
</script>
