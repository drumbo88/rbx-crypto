<template>
	<v-container>
		
	</v-container>
</template>

<script>
import { mapGetters } from 'vuex'
	export default {
		name: 'BuysList',
		props: ['mins', 'symbol', 'coin', 'base'],
		components: {  },
		data: () => ({
			BTCUSDT: null,
			infoBuys: null,
			series: [],
			categories: [],
			qTotals: [],
			pointWidth: null,
		}),
		created () {
		},
		async mounted () {
			//let symbol = this.getSymbol()
			//this.API_GET_PROFILE_ORDERS = process.env.VUE_APP_API_URL + `/profile/orders${symbol ? '/'+symbol : ''}`
			//setInterval(this.getTradeData, 60000)
			/*if (this.getSymbol('BTCUSDT'))
				this.BTCUSDT = this.getSymbol('BTCUSDT').price
			this.getProfileOrders()
			setInterval(() => this.getProfileOrders(), this.getIntervalMins * 60000)*/
		},
		methods: {
			async getProfileOrders () 
			{
				let promises = []
				//if (!this.getPrices().length)
					promises.push(this.$store.dispatch('tickers/get', {}/*this.getSymbol()*/))

				if (!this.getPrices().length)
					promises.push(this.$store.dispatch('loadBuysList', {}/*this.getSymbol()*/))

				if (promises.length)
					await Promise.all(promises)

				this.BTCUSDT = this.getSymbol('BTCUSDT').price

				this.series = []
				this.qTotals = []
				this.categories = []
				//let numCoins = 0
				/*let coinsObjs = this.$store.getters.getBuysList() // (this.getSymbol())
                for (let j=0; j<coinsObjs.length; j++) {
					let coinObj = coinsObjs[j]
					coinObj.volatility = 0
					let actualPrice = (coinObj.name == 'BTC') ? this.BTCUSDT : this.getSymbol(coinObj.name + 'BTC').price
					let refPrice = actualPrice / ((coinObj.name == 'BTC') ? 1 : this.BTCUSDT)
					let symbol = (coinObj.name == 'BTC') ? 'BTCUSDT' : (coinObj.name + 'BTC')
					let totalChange = 0, totalPrice = 0, symVolat = volatilities[symbol]
					console.log(coinObj.name, actualPrice, refPrice)
					if (symVolat.length) {
						console.log(`Volat. '${symVolat.length}' desde ${new Date(symVolat[0].openTime).toLocaleString()} a ${actualPrice.toFixed(8)}`)
						for (let j=0; j<symVolat.length; j++) {
							let volat = symVolat[j]
							let diffAvg = (parseFloat(volat.high) - parseFloat(volat.low)) / ((parseFloat(volat.open) + parseFloat(volat.close)) / 2)
							coinObj.volatility += diffAvg
							console.log(volat, diffAvg)
						}
						coinObj.volatility /= symVolat.length // AVG
						//coinObj.volatility /= (coinObj.name == 'BTC') ? this.BTCUSDT : actualPrice // %
						coinObj.volatility *= 100
					}
					for (let i=0; i<coinObj.buys.length; i++) {
						let buyOrder = coinObj.buys[i]
						if (coinObj.name == 'BTC') buyOrder.price = actualPrice
						buyOrder.change = actualPrice - buyOrder.price
						//if (coinObj.name == 'BTC') console.log(actualPrice,buyOrder.price,actualPrice / buyOrder.price)
						buyOrder.changePerc = ((actualPrice / buyOrder.price) - 1) * 100
						buyOrder.changePercStr = buyOrder.changePerc.toFixed(2) + '%'
						buyOrder.changeUSD = buyOrder.quantity * buyOrder.change * this.BTCUSDT
						buyOrder.changeUSDStr = '$'+(buyOrder.changeUSD).toFixed(2)
						buyOrder.actualTotalPrice = buyOrder.quantity * actualPrice
						buyOrder.actualTotalPriceUSD = buyOrder.actualTotalPrice * this.BTCUSDT
						//console.log(coinObj.name, buyOrder.quantity , actualPrice,buyOrder.actualTotalPrice * this.BTCUSDT)
						
						if (Math.abs(buyOrder.actualTotalPriceUSD) < 1) continue
						
						totalPrice += buyOrder.price * buyOrder.quantity
						totalChange += buyOrder.change * buyOrder.quantity
						let qtyFixed = (buyOrder.quantity < 1) ? 8 : 2 
						let datetimeStr = new Date(buyOrder.time).toLocaleString()

						let chgColor = 'inherit', chgArrow = ''
						if (Math.abs(buyOrder.changePerc) >= 1) {
							chgColor = buyOrder.changePerc > 0 ? 'limegreen' : 'red' 
							chgArrow = buyOrder.changePerc > 0 ? '↑' : '↓' 
						}
						let chgPercStr = buyOrder.changePerc.toFixed(3)+'% '+chgArrow

						this.series.push({
							//name: `${buyOrder.quantity.toFixed(qtyFixed)} ${coinObj.name}<br />${buyOrder.actualTotalPrice.toFixed(8)} BTC`,
							name: `<span style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">
								${parseFloat(buyOrder.quantity.toFixed(qtyFixed)).toString()}
								<br />
								<span style="color: ${chgColor}">${chgPercStr}</span>
							</span>`,
							data: [{ 
								x: numCoins, y: buyOrder.actualTotalPrice, 
								description: `
									<b>${datetimeStr}</b><br />
									Remain: ${buyOrder.quantity.toFixed(2)} (${parseFloat((buyOrder.quantity * 100 / buyOrder._quantity).toFixed(1))}%)<br />
									Remain BTC: <br />${buyOrder.actualTotalPrice.toFixed(8)}<br />
									Remain USD: <br />${buyOrder.actualTotalPriceUSD.toFixed(2)}<br />
									Bought: ${buyOrder._quantity.toFixed(2)}<br />
									Buy Price: ${buyOrder.price.toFixed(8)}<br />
									Chg: ${buyOrder.changePercStr} (${buyOrder.changeUSDStr})<br />
								`
							}],
							color: `rgba(${this.coinsColors[j]}, ${(i%2) ? '1' : '0.8'})`
						});
					}
					//if (!totalChange) continue

					numCoins++
					this.categories.push(`${coinObj.name} <br/><small>(V: ${coinObj.volatility.toFixed(2)}%)</small>`)
					let totalChangePerc = totalChange * 100 / totalPrice
					let chgColor = 'inherit', chgArrow = ''
					if (Math.abs(totalChangePerc) >= 1) {
						chgColor = totalChangePerc > 0 ? 'green' : 'red' 
						chgArrow = totalChangePerc > 0 ? '↑' : '↓' 
					}
					this.qTotals.push({
						chgPercStr: totalChangePerc.toFixed(3)+'% '+chgArrow,
						chgColor: chgColor,
						actualPrice: actualPrice
					})

					//qtyBuys = qtySells; qtySells = qtyBuys
					//console.log(`COIN: ${coinObj.name}`)
					//console.log(`REM: ${coinObj.buys.length}`)
				}
				this.pointWidth = 80 + (20 / this.series.length)
				*/
			}
		},
		computed: {
			...mapGetters('tickers', ['getSymbol','getPrices']),
			...mapGetters('balance', ['getTotalBalanceBTC']),
			//...mapGetters('balance', ['getBuysList']),

			getIntervalMins() {
				let mins = this.mins || 5
				const unSeg = 1/60
				if (mins < unSeg)
				mins = unSeg
				console.log(`[${this.$options.name}] Repetición de peticiones: ${mins} minutos`)
				return mins
			},
			getTotalBalanceBTC() {
				return this.$store.getters.getTotalBalanceBTC
			},
			chartOptions() {     
				const BTCUSDT = this.BTCUSDT
				const TOTAL_BTC = this.getTotalBalanceBTC
                const maxTotal = 0
				
				let options = {
					chart: { type: 'column' },
					title: { text: 'Compras en vigencia' },
					xAxis: {
						categories: this.categories,
						labels: { style: { fontSize: '1.2em', fontWeight: 'bold' } },
					},
					yAxis: {
						reversedStacks: false,
						// Nombre del EJE Y
						title: { text: 'Equivalente BTC' },
						// Medidas del EJE Y
						labels: { 
							formatter() { 
								let valor = parseFloat(this.value.toFixed((maxTotal < 0.01) ? 8 : 2)).toString()
								let porcentaje = (this.value * 100 / TOTAL_BTC).toFixed(1).toString()
								return `${valor} (${porcentaje}%)` 
							} 
						},
						// Sobre la pila
						stackLabels: {
							enabled: true,
							qTotals: this.qTotals,
							style: { fontWeight: 'normal', textAlign: 'center' },
							formatter() { 
								let qTotal = this.options.qTotals[this.x]
								return `
									<b>${this.total.toFixed(8)} BTC = $${(this.total * BTCUSDT).toFixed(2)}</b>
									<br />
									<span style="color: ${qTotal.chgColor}">
										${qTotal.actualPrice.toFixed(8)} (${qTotal.chgPercStr})
									</span>
								`
							},
						},
					},
					series: this.series,
					tooltip: {
						pointFormat: '{point.description}',
						shared: false
					},
					legend: {
						enabled: false,
						reversed: false
					},
					plotOptions: {
						series: {
							states: { inactive: { opacity: 1 } },
							stacking: 'normal',
							pointWidth: this.pointWidth,
							dataLabels: {
								enabled: true,
								useHTML: true,
								format: '{series.name}', // Lo que aparece en cada cuadro
								align: 'center',
								style: {
									color: 'white',
									//fontSize: '1.1em',
									align: 'center',
									textAlign: 'center',
									fontWeight: 'pointer',
								},
							}
						}
					},
					credits: {
						text: 'RBX-Crypto'
					}
				}
				//new Audio('/public/popup 8.mp3').play();
				console.log('GRAFICO CONFIGURADO')
				return options
			},
		}
	}
</script>
