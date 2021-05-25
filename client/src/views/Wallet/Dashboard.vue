<template>
    <v-container>
        <v-row>
            <v-col cols="5">
                <AssetsChart />
            </v-col>
            <v-col cols="7">
                <AssetsTable />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    // import Assets from '@/components/Assets/Assets.vue'
    import AssetsChart from '@/components/Assets/Chart.vue'
    import AssetsTable from '@/components/Assets/Table.vue'

    export default {
        name: 'WalletDashboardView',
        components: {
            AssetsChart, AssetsTable
        },
        props: {
            fstCoin: { type: String, required: false }, 
            sndCoin: { type: String, required: false }
        },
        data() {
            return {
            }
        },
        computed: {
            ucCoin() { return this.coin.toUpperCase() }
        }
    }
</script>
