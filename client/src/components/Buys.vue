<template>
	<v-container>
		<chart class="chart" :constructor-type="'chart'" :options="chartOptions" :key="'lalala'"></chart>
	</v-container>
</template>

<script>
	import axios from 'axios';
	import { Chart } from "highcharts-vue";
	const BTCUSDT = 44800, maxTotal = 0

	export default {
		name: 'Buys',
		props: ['symbol', 'coin', 'base'],
		components: { Chart },
		data: () => ({
			infoBuys: null,
			chartOptions: {
				chart: { type: 'column' },
				xAxis: {
					categories: [/*'BTCST',...*/],
					labels: { style: { fontSize: '1.2em', fontWeight: 'bold' } },
				},
				yAxis: {
					reversedStacks: false,
					// Nombre del EJE Y
					title: { text: 'Equivalente BTC'	},
					// Medidas del EJE Y
					labels: { formatter() { return this.value.toFixed((maxTotal < 0.01) ? 8 : 2) } },
					// Sobre la pila
					stackLabels: {
						enabled: true,
						qTotals: [],
						style: { fontWeight: 'normal', textAlign: 'center' },
						align: 'center',  
						formatter() { 
							let qTotal = this.options.qTotals[this.x]
							return `
								<b>${this.total.toFixed(8)} BTC = $${(this.total * BTCUSDT).toFixed(2)}</b>
								<br />
								<span style="color: ${qTotal.chgColor ? qTotal.chgColor : 'inherit'}">
									${qTotal.actualPrice.toFixed(8)} (${qTotal.chgPercStr})
								</span>
							`
						},
					},
				},
				series: [/*{
					"name": "XXXXX",
					"data": [{x: 0, y: 20.25}],
					"color": "rgba(100,100,100,1)",
				*/],
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
						stacking: 'normal',
						pointWidth: 100,
						dataLabels: {
							enabled: true,
							format: '{series.name}', // Lo que aparece en cada cuadro
							style: {
								color: 'white',
								//fontSize: '1.1em',
								fontWeight: 'pointer',
								//textOutline: '0px contrast',
							},
						}
					}
				},
				credits: {
					text: 'RBX-Crypto'
				}
			}
		}),
		created () {
		},
		mounted () {
			let coin = this.coin || ''
			let base = this.base || ''
			//let limit = this.limit || 10
			if (this.symbol) {
				let symbolParts = this.symbol.split('-').slice(0, 2)
				symbolParts = symbolParts.reverse()
				base = symbolParts[0]
				coin = symbolParts[1]
				//[this.base, this.coin] = symbolParts.reverse()
			}
			let symbol = (coin || base) ? `${coin}-${base}` : ''
			this.API_GET_PROFILE_ORDERS = process.env.VUE_APP_API_URL + `/profile/orders${symbol ? '/'+symbol : ''}`
			//setInterval(this.getTradeData, 60000)
			this.getProfileOrders()
		},
		methods: {
			getProfileOrders () {
				axios.get(this.API_GET_PROFILE_ORDERS)
					.then(response => {
						this.infoBuys = []
						let qtyBuys = 0, qtySells = 0, coins = [], coinsObjs = [], coinObj
						for (let order of response.data.data) 
						{
							if (!order.symbol.endsWith('BTC')) continue
							// ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Para que solo vea XXXBTC

							let coin = order.symbol.slice(0, -3) // quito BTC del final
							let posCoin = coins.indexOf(coin)
							if (posCoin == -1) {
								posCoin = coins.length
								coins.push(coin)
								coinObj = {
									name: coin,
									buys: [],
									// sellQuantity
								}
								coinsObjs.push(coinObj)
							}
							else coinObj = coinsObjs[posCoin]

							if (order.side == 'BUY') {
								qtyBuys++
								coinObj.buys.push(order)
							} else {
								qtySells++
								coinObj.sellQuantity = order.quantity
								for (let i=coinObj.buys.length - 1; coinObj.sellQuantity > 0 && i>=0; i--) {
									let buyOrder = coinObj.buys[i]
									let usdDif = (coinObj.sellQuantity - buyOrder.quantity) * order.price * 50000
									if (usdDif >= -5) {
										coinObj.sellQuantity -= buyOrder.quantity
										coinObj.buys.pop()
									} 
									else {
										buyOrder.quantity -= coinObj.sellQuantity
										order.quantity = coinObj.sellQuantity = 0;
									}
								}
							}
						}
						let series = []
						let qTotals = []
						let coinsColors = [
							'050,100,200',
							'050,200,100',
							'200,050,200',
							'100,200,050',
							'200,200,100',
							'200,100,100',
						]
						let numCoins = 0
						for (let j=0; j<coinsObjs.length; j++) {
							coinObj = coinsObjs[j]
							let actualPrice = 0.0001
							switch (coinObj.name) {
								case 'BTCST': actualPrice = 0.0073562; break
								case 'XVS': actualPrice = 0.0010141; break
								case 'OGN': actualPrice = 0.00000875; break
								case 'XEM': actualPrice = 0.00001317; break
								case 'UNFI': actualPrice = 0.000815; break
								case 'GRS': actualPrice = 0.00001506; break
							}
							let totalChange = 0, totalPrice = 0
							for (let i=0; i<coinObj.buys.length; i++) {
								let buyOrder = coinObj.buys[i]
								buyOrder.change = actualPrice - buyOrder.price
								buyOrder.changePerc = ((actualPrice / buyOrder.price) - 1) * 100
								buyOrder.changePercStr = buyOrder.changePerc.toFixed(2) + '%'
								buyOrder.changeUSD = buyOrder.quantity * buyOrder.change * BTCUSDT
								if (buyOrder.totalPriceUSD < 1) continue
								buyOrder.changeUSDStr = '$'+(buyOrder.changeUSD).toFixed(2)
								buyOrder.actualTotalPrice = buyOrder.quantity * actualPrice
								totalPrice += buyOrder.price * buyOrder.quantity
								totalChange += buyOrder.change * buyOrder.quantity
								let qtyFixed = (buyOrder.quantity < 1) ? 4 : 0 
								let datetimeStr = new Date(buyOrder.time).toLocaleString()
								series.push({
									name: `${buyOrder.quantity.toFixed(qtyFixed)} ${coinObj.name}<br />${buyOrder.actualTotalPrice.toFixed(8)} BTC`,
									data: [{ 
										x: numCoins, y: buyOrder.actualTotalPrice, 
										description: `
											${datetimeStr}<br />
											Price: ${buyOrder.price.toFixed(8)}<br />
											Chg: ${buyOrder.changePercStr}
											
										`
									}],
									color: `rgba(${coinsColors[j]}, ${(i%2) ? '1' : '0.8'})`
								});
							}
							if (!totalChange) continue

							numCoins++
							this.chartOptions.xAxis.categories.push(coinObj.name)
							let totalChangePerc = totalChange * 100 / totalPrice
							let chgColor = '', chgArrow = ''
							if (Math.abs(totalChangePerc) >= 1) {
								chgColor = totalChangePerc > 0 ? 'green' : 'red' 
								chgArrow = totalChangePerc > 0 ? '↑' : '↓' 
							}
							qTotals.push({
								chgPercStr: totalChangePerc.toFixed(3)+'% '+chgArrow,
								chgColor: chgColor,
								actualPrice: actualPrice
							})

							qtyBuys = qtySells; qtySells = qtyBuys
							/*console.log(`COIN: ${coinObj.name}`)
							console.log('$'+(totalChange*BTCUSDT).toFixed(3))
							console.log(totalChangePerc.toFixed(3)+'%')
							console.log(`BUYS: ${qtyBuys}`)
							console.log(`SELLS: ${qtySells}`)
							console.log(`REM: ${coinObj.buys.length}`)*/
						}
						this.chartOptions.series = series
						this.chartOptions.yAxis.stackLabels.qTotals = qTotals
						console.log(this.chartOptions)
					})
			}
		}
	}
</script>
