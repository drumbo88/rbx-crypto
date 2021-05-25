<template>
	<div>
		<chart 
			class="chart" 
			:constructor-type="'chart'" 
			:options="chartOptions" 
			>
		</chart>
	</div>
</template>

<script>
	import { Chart } from "highcharts-vue";
	import { mapGetters } from 'vuex';

	//const maxTotal = 0

	export default {
		name: 'AssetsChart',
		//props: ['mins', 'symbol', 'coin', 'base'],
		components: { Chart },
		data: () => ({
			// getCurrency: 'BUSD',
			tableColumns: [
				{ attr: { label: 'Asset', 		prop: 'name' }, slot: true },
				{ attr: { label: 'Balance', 	prop: 'balanceUSDT', type: Number } },
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
			this.getChartData()
			setInterval(() => this.getChartData(), this.getIntervalMins * 60000)
		},
		methods: {
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
			async getChartData () 
			{
				let promises = []
				//if (!this.getPrices().length)
					promises.push(this.$store.dispatch('tickers/get', {}))

				if (!this.assets.length)
					promises.push(this.$store.dispatch('wallet/getAssets', {}))

				if (promises.length) {
					try {
						await Promise.all(promises)
					}
					catch (error) {
						console.log(error)
					}
				}
			},
			rowSelected(rows) {
				this.checkedRows = rows;
				//console.log(this.checkedRows.map(r => r.userId));
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
				console.log(index)
			}
		},
		computed: {
			...mapGetters('tickers', [
				'getSymbol', 'getPrice', 'getPrices', 'getVolatilities',
				'getCurrency', 'getCurrencyPrice'
			]),
			...mapGetters('wallet', [
				'assets', 
				'getAssetsPrices', 
				'getTotalBalance', 
				'getUnsoldBuyOrders',
				'totalBalanceBTC',
				'totalBalanceUSDT'
			]),

			//getCurrencyPrice() { return this.getPrice('BTC' + this.getCurrency) || 0 },
			getIntervalMins() {
				let mins = this.mins || 1
				const unSeg = 1/60
				if (mins < unSeg)
					mins = unSeg
				console.log(`[${this.$options.name}] Repetición de peticiones: ${mins} minutos`)
				return mins
			},
			chartOptions() {     
				
				let categories = []
				let serieObj = { name: 'Assets', colorByPoint: true, data: [] }

				if (this.getCurrencyPrice) {
					this.getAssetsPrices(this.getCurrency).forEach(asset => {
						categories.push(asset.name)
						let value = this.getCurrency ? asset.total : asset.quantity
						if (value > 0)
							serieObj.data.push({ 
								name: asset.name, 
								y: value,
								balanceUSDT: value.toFixed(2),
								priceBTC: (asset.price / this.getCurrencyPrice).toFixed(8),
								priceUSDT: (asset.price).toFixed(2),
								balancePerc: (100 * value / this.totalBalanceUSDT).toFixed(2),
								changePerc: (10-20*Math.random()).toFixed(2),
								btnsOpciones: '' //'Ver '+asset.name
							})
					})
					serieObj.data = serieObj.data.sort((a,b) => b.y - a.y)
				}
				let series = [serieObj]
				
				//const cyPrice = this.getCurrencyPrice
				const totalBalance = this.getTotalBalance(this.getCurrency)
				
				let options = {
					chart: { type: 'column' },
					title: { text: 'Activos actuales' },
					xAxis: {
						type: 'category',
						//categories
						//labels: { style: { fontSize: '1.2em', fontWeight: 'bold' } },
					},
					yAxis: {
						// Nombre del EJE Y
						title: { text: this.getCurrency ? 'Equivalente '+this.getCurrency : 'Cantidades' },
						// Medidas del EJE Y
						/*labels: { 
							formatter() { 
								let valor = parseFloat(this.value.toFixed((maxTotal < 0.01) ? 8 : 2)).toString()
								if (totalBalance) {
									let porcentaje = (this.value * 100 / totalBalance).toFixed(1).toString()
									return `${valor} (${porcentaje}%)` 
								}
								return totalBalance
							} 
						},*/
						// Sobre la pila
						/*stackLabels: {
							enabled: true,
							qTotals: this.qTotals,
							style: { fontWeight: 'normal', textAlign: 'center' },
							formatter() { 
								//let qTotal = this.options.qTotals[this.x]
								return `
									<b>${(this.total).toFixed(2)}</b>
									<br />
								`
							},
						},*/
					},
					series: series,
					tooltip: { // Valor al poner el mouse sobre el punto/columna
						//headerFormat: '{series.name}<br />',
						//pointFormat: {
							formatter() {
								let valor = this.point.y.toFixed(2),
									porc = valor / totalBalance * 100
								return this.point.name+'<br />'+ porc.toFixed(2)+'%'
							}
						//},
						//shared: false
					},
					legend: {
						enabled: false,
						reversed: false
					},
					plotOptions: {
						series: {
							states: { inactive: { opacity: 1 } },
							//stacking: 'normal',
							//pointWidth: this.pointWidth,
							dataLabels: {
								enabled: true,
								useHTML: true,
								format: '{point.y:.2f}', // Lo que aparece en cada cuadro
								/*format() { 
									let valor = parseFloat(this.value.toFixed(2)).toString()
									if (totalBalance) {
										let porcentaje = (this.value * 100 / totalBalance).toFixed(1).toString()
										return `${valor} (${porcentaje}%)` 
									}
									return totalBalance
								},*/
								align: 'center',
								/*style: {
									color: 'white',
									//fontSize: '1.1em',
									align: 'center',
									textAlign: 'center',
									fontWeight: 'pointer',
								},*/
							}
						}
					},
				}
				//new Audio('/public/popup 8.mp3').play();
				return options
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

