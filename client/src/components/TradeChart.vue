<template>
  <v-container>
    {{ info }}
  </v-container>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'TradeChart',
    props: ['pair'],
    data: () => ({
      info: null
    }),
    created () {
      this.API_GET_TRADE_DATA = process.env.VUE_APP_API_URL + `/trades/${this.pair}/`
    },
    mounted () {
      setInterval(this.getTradeData, 60000)
      this.getTradeData()
    },
    methods: {
      getTradeData () {
        axios.get(this.API_GET_TRADE_DATA)
          .then(response => (this.info = response))
      }
    }
  }
</script>
