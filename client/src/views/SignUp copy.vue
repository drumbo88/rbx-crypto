<template>
  <div class="home">
    <!--input type="text" v-model="coin" style="border: 1px inset black; background: yellow" /-->
    <v-container>
      <v-row>
        <v-col>
          <MarketTopChanges :mins="mins" :coin="ucCoin" base="BTC" />
        </v-col>
        <v-col>
          <Buys :mins="mins" />
        </v-col>
      </v-row>
      <v-row>
        <BuysList />
      </v-row>
    </v-container>
    <SignUp msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import Buys from '@/components/Buys.vue'
import BuysList from '@/components/BuysList.vue'
import SignUp from '@/components/Users/SignUp.vue'
import MarketTopChanges from '@/components/MarketTopChanges.vue'
//import TradeChart from '@/components/TradeChart.vue'

export default {
  name: 'SignUpView',
  data() {
    return {
      mins: 1,
      coin: ''
    }
  },
  components: {
    SignUp, MarketTopChanges, Buys, BuysList
  },
  computed: {
    ucCoin() { return this.coin.toUpperCase() }
  }
}
</script>
