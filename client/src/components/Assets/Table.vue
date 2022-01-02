<template>
	<div>
		<rbx-table 
			:tab-columns="tableColumns" 
			:tab-datas="tableData"
			:tab-summary="tableSummary"
			@rowSelectionChanged="rowSelected"
		>   
			<template slot="name" slot-scope="scope">
				<b>{{ scope.value }}</b>
			</template>

			<template slot="changePerc" slot-scope="scope">
				<el-tag :type="scope.value > 1 ? 'success' : 'danger'" size="mini">
					{{ scope.value }}
				</el-tag>
			</template>

			<!--  table batch operation area -->
			<template slot="btnsOpciones" slot-scope="scope">
				<el-button type="primary" icon="el-icon-s-data" size="mini"
					title="Ver detalle"
					@click="verDetalle(scope.row.name)">
				</el-button>
			</template>

		</rbx-table>

		<rbx-modal :visible.sync="showModal" :title="modal" :before-close="closeModal">
			<rbx-chart-candles v-if="showModal"
				:symbol="symbol"
			/>
		</rbx-modal>
	</div>
</template>

<script>
	import RbxModal from '../Shared/RbxModal.vue';
	import RbxTable from "@/components/Shared/RbxTable";
	import RbxChartCandles from '../Shared/RbxChartCandles.vue';
	import { mapGetters } from 'vuex';

	export default {
		name: 'AssetsTable',
		//props: ['mins', 'symbol', 'selectedCoin', 'base'],
		props: ['currency', 'base'],
		components: { RbxModal, RbxTable, RbxChartCandles },
		data: () => ({
			selectedCoin: null,
			tableColumns: [
				{ attr: { label: 'Asset', 		prop: 'name' }, slot: true },
				{ attr: { label: 'Balance ($)',	prop: 'balanceUSDT', type: Number } },
				{ attr: { label: 'Price (BTC)', prop: 'priceBTC', type: Number } },
				{ attr: { label: 'Price ($)', 	prop: 'priceUSDT', type: Number } },
				{ attr: { label: '%', 			prop: 'balancePerc', type: Number } },
				{ attr: { label: 'Chg 1h%', 	prop: 'changePerc', type: Number }, slot: true },
				{ attr: { label: '#', 			prop: 'btnsOpciones', type: Array, sortable: false }, slot: true },
			],
		}),
		created () {
		},
		async mounted () {
			this.getAssetsData()
			setInterval(() => this.getAssetsData(), this.getIntervalMins * 60000)
		},
		methods: {
			closeModal(done) {
				this.selectedCoin = null
				done();
			},
			tableFormatter(index) { 
				let x = [
					this.formatAsset,
					null,null,null,null,null
				]
				return x[index]
				//console.log('xxx',row, col); return `<b>${row}</b>`; 
			},
			formatAsset: (row, col, value) => { console.log('xxx',row, col); return `<b>${value}</b>`; },
			tableSorter(index) {
				return this.tableSorters[index]
			},
			async getAssetsData () 
			{
				let promises = []
				//if (!this.getPrices().length)
					promises.push(this.$store.dispatch('tickers/get', {}))

				if (!this.assets.length)
					promises.push(this.$store.dispatch('wallet/getAssets', {}))

				if (promises.length) {
					try {
						await Promise.all(promises)

						//this.getAssetsPrices()
					}
					catch (error) {
						console.log(error)
					}
				}
			},
			rowSelected(rows) {
				this.checkedRows = rows;
			},
			tableSummary() {
				return [ 
					'Total', 
					this.totalBalanceUSDT.toFixed(2), 
					this.totalBalanceBTC.toFixed(8), 
					this.totalBalanceUSDT.toFixed(2),
					(100).toFixed(2),
				]
			},
			verDetalle(index) {
				this.selectedCoin = index
			}
		},
		computed: {
			...mapGetters('tickers', [
				'getCurrency', 'getCurrencyPrice',
				'getSymbol', 'getPrice', 'getPrices', 'getVolatilities'
			]),
			...mapGetters('wallet', [
				'assets', 'getAssetsPrices', 
				'getTotalBalance', 
				'getUnsoldBuyOrders',
				'totalBalanceBTC',
				'totalBalanceUSDT'
			]),

			showModal() {
				return Boolean(this.selectedCoin)
			},

			getIntervalMins() {
				let mins = this.mins || 1
				const unSeg = 1/60
				if (mins < unSeg)
					mins = unSeg
				console.log(`[${this.$options.name}] Repetición de peticiones: ${mins} minutos`)
				return mins
			},

			modal() { return this.showModal ? 'Detalles de ' + this.selectedCoin : null },

			myCurrency() {
				return this.getCurrency(this.currency)
			},
			myCurrencyPrice() {
				return this.getCurrencyPrice(this.myCurrency) || 0
			},
			symbol() { 
				const baseCurrency = (this.selectedCoin == this.myCurrency) 
					? ((this.selectedCoin == 'USDT') ? 'BTC' : 'USDT')
					: this.myCurrency
				return this.selectedCoin ? this.selectedCoin + baseCurrency : null 
			},
			/*currencyPrice() { 
				const currency = (this.currency == 'BTC') ? 'USDT' : this.currency
				return this.getPrice('BTC' + currency) || 0 
			},*/

			tableData() {
				let data = []

				if (this.myCurrency) {
					this.getAssetsPrices(this.myCurrency).forEach(asset => {
						let value = this.myCurrency ? asset.total : asset.quantity
						if (value > 0)
							data.push({ 
								name: asset.name, 
								y: value,
								balanceUSDT: value.toFixed(2),
								priceBTC: (asset.price / this.myCurrencyPrice).toFixed(8),
								priceUSDT: (asset.price).toFixed(2),
								balancePerc: (100 * value / this.totalBalanceUSDT).toFixed(2),
								changePerc: (10-20*Math.random()).toFixed(2),
								btnsOpciones: '' //'Ver '+asset.name
							})
					})
					data = data.sort((a,b) => b.y - a.y)
				}
				return data
			},
			tableFooterData() {
				return { 
					name: 'Total', 
					y: this.totalBalanceUSDT, 
					balanceUSDT: this.totalBalanceUSDT.toFixed(2), 
					priceBTC: this.totalBalanceBTC.toFixed(8), 
					priceUSDT: this.totalBalanceUSDT.toFixed(2),
					balancePerc: (100).toFixed(2),
					changePerc: '-',
				}
			},
			tableSorters() {
				return this.tableColumns.map(col => {
					if (col.sortable === false)
						return null
					const prop = col.value
					if (col.type === Number)
						return (a,b) => (parseFloat(a[prop]) > parseFloat(b[prop])) ? 1 : -1
					return null
				})
			},
		}
	}
</script>

<style>
	.table-cell { padding: '30px'; background-color: yellow !important }
	.el-table__header .is-leaf { color: white !important }
</style>
