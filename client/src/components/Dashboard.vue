<template>
    <v-container>
        <v-row>
        <v-col>
            <MarketTopChanges :mins="mins" :coin="ucCoin" base="USDT" />
        </v-col>
        <v-col>
            <Buys :mins="mins" base="USDT" />
        </v-col>
        </v-row>
        <v-row>
            <BuysList />
        </v-row>
    </v-container>
</template>

<script>
    import Buys from '@/components/Buys.vue'
    import BuysList from '@/components/BuysList.vue'
    import MarketTopChanges from '@/components/MarketTopChanges.vue'
    //import TradeChart from '@/components/TradeChart.vue'

    export default {
        name: 'Dashboard',
        data() {
            return {
                mins: 1,
                coin: ''
            }
        },
        components: {
            MarketTopChanges, Buys, BuysList
        },
        computed: {
            ucCoin() { return this.coin.toUpperCase() }
        }
    }
</script>
