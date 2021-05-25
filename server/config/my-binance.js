let BinanceApi = require('binance-api-node').default


let myBinance = {
	api: BinanceApi({
		apiKey: process.env.BINANCE_API_KEY,
		apiSecret: process.env.BINANCE_API_SECRET,
		useServerTime: true,
		recvWindow: 20000,
	}),
	time() {
		return this.api.time()
	},
	balance: {
		totalBTC: 0,
		assets: null
			// [{ symbol: 'ETH', qty: 0, _totalBTC: 0 }]
		,
	},
	prices: {
		// BASE_SYMBOL: { ... },
	},
	markets: {
		// BASE_SYMBOL: { ... },
	},
	trades: [],
	async parseRes(data) { 
		return { ...this.res, _USDT: this.prices.BTCUSDT, data: data || null, time: await this.api.time() }
	},
	async getPrices() { 
		// Get ticker prices
		ticker = await this.api.prices()
		
		this.prices = {}
		for ( let symbol in ticker ) 
			this.prices[symbol] = parseFloat(ticker[symbol]);
			
		return this.prices
	},
	async getVolatilities() { 
		this.volatilities = {}
		//if (!this.balance.assets.length)
			//await this.myBalance()
		let promises = []
		if (this.balance.assets)
		for ( let i=0; i<this.balance.assets.length; i++ ) {
			//if (this.prices[symbol] > 1) {
				/*let symbol = this.balance.assets[i].nameTradeBTC
				promises.push(new Promise(async res => {
					const params = { 
						symbol,
						interval: '5m', 
						limit: 5 
					}
					try {
						candles = await this.api.candles(params)
					}
					catch (err) {
						return err
					}
					// calcular volatilidades
					this.volatilities[symbol] = candles
					return res(candles)
				})) */
			//}
		}
		if (promises.length)
			await Promise.all(promises)/*.then((res) => {
				// Calcular algo global
				return res()
			})*/

		return this.volatilities
	},
	async getAssets() {
		if (this.balance.assets === null)
			await this.myBalance()
		return this.balance.assets
	},
	async myBalance() 
	{
		this.prices = await this.getPrices()
		let accountInfo = await this.api.accountInfo()
		let balances = accountInfo.balances
		const FIELD_AVAILABLE = 'free'
		const FIELD_ON_ORDER = 'locked'

		this.balance.assets = []

		//global.btc = 0.00;
		for (let i=0; i<balances.length; i++ ) {
			let obj = balances[i]
			let asset = obj.asset
			obj.name = asset
			obj.available = parseFloat(obj[FIELD_AVAILABLE]);
			obj.onOrder = parseFloat(obj[FIELD_ON_ORDER]);
			obj.porc = 0;
			obj.btcAvailable = 0;
			obj.btcTotal = 0;
			obj.trades = []
			obj.quantity = obj.available + obj.onOrder;
			if ( asset == 'BTC' ) {
				obj.nameTradeBTC = asset + 'USDT';
				obj.btcAvailable = obj.available;
			}
			else if ( asset == 'USDT' ) obj.btcAvailable = obj.available / this.prices.BTCUSDT;
			else {
				obj.nameTradeBTC = asset + 'BTC';
				obj.btcAvailable = obj.available * this.prices[obj.nameTradeBTC];
			}
			if ( asset == 'BTC' ) obj.btcTotal = obj.available + obj.onOrder;
			else if ( asset == 'USDT' ) obj.btcTotal = (obj.available + obj.onOrder) / this.prices.BTCUSDT;
			else obj.btcTotal = (obj.available + obj.onOrder) * this.prices[asset+'BTC'];
			if ( isNaN(obj.btcAvailable) ) obj.btcAvailable = 0;
			if ( isNaN(obj.btcTotal) ) obj.btcTotal = 0;
			obj.usdUnitPrice = obj.btcTotal * this.prices[asset+'USDT'];
			obj.usdTotal = obj.btcTotal * this.prices.BTCUSDT;

			if ( obj.usdTotal < 1) { 
				//if (obj.usdTotal>0) console.log(obj); 
				if (!obj.usdTotal) 
					continue;
			}

			this.totalBTC += obj.btcTotal;
			this.balance.assets.push(obj);
		}

		return this.balance
	},
	
	async myTrades(filters) 
	{
		if (filters.coin ^ filters.base)
			return console.error("Necesita ambos parámetros 'coin' y 'base'")

		if (filters.coin)
			filters.symbol = filters.coin + filters.base

		//if (!this.balance.assets.length)
			//await this.myBalance()
		await this.getAssets()

		this.trades = []
		let promises = []
		let assets = this.balance.assets

		for (let i=0; i<assets.length; i++)
		{
			if (!filters.symbol || filters.symbol == assets[i].nameTradeBTC)
			{
				promises.push(new Promise(async (res) => {
					let obj = assets[i]
					obj.trades = [] // RESETEA TRADES
					let orders = [], trades = []
					if (obj.nameTradeBTC && obj.nameTradeBTC != 'BTCUSDT') {
						try {
							[orders, trades] = await Promise.all([
								this.api.allOrders({ symbol: obj.nameTradeBTC }),
								this.api.myTrades({ symbol: obj.nameTradeBTC })
							])
						}
						catch (err) {
							console.log("Error "+obj.nameTradeBTC, err.message, err.stack)
						}
					}
					if (!orders.length && obj.btcTotal) {
						let price = (obj.nameTradeBTC == 'BTCUSDT') ? 1 : this.prices[obj.nameTradeBTC]
						orders.push({
							side: 'BUY',
							status: 'GENERATED',
							symbol: obj.nameTradeBTC,
							price: this.prices[obj.nameTradeBTC],
							executedQty: obj.btcTotal / price,
						})
					}
					/*if (true && obj.nameTradeBTC=='BNBBTC' ) {
						console.log("ORDERS: ",orders.slice(0, 16))
						console.log("TRADES: ",trades.map(x=>x.orderId))
					}*/
					for (let j=0; j<orders.length; j++) {
						let order = orders[j];
						/*if (order.side == 'BUY' && order.status == 'FILLED') {
							order.price = parseFloat(asset == 'BTC' ? order.price / this.prices.BTCUSDT : order.price)
							obj.buys.push({...})
						}*/
						let orderTrades = trades.filter(x => x.orderId == order.orderId)
						let price = orderTrades.length ? orderTrades[0].price : order.price
						// (!) Falta convertir la comisión a BTC cuando sea en otra moneda
						let commissionBTC = 0
						if (orderTrades.length) {
							for (let k=0; k<orderTrades.length; k++)
								commissionBTC += parseFloat(orderTrades[k].commission)
						}
						else commissionBTC = (order.price * order.executedQty / 1000) 
						
						obj.trades.push({
							time: order.time,
							//date: new Date(order.time),
							side: order.side,
							status: order.status,
							symbol: order.symbol,
							price: parseFloat(price),
							quantity: parseFloat(order.executedQty),
							totalPrice: price * order.executedQty,
							totalPriceUSD: price * order.executedQty * this.prices.BTCUSDT,
							commissionBTC: commissionBTC,//parseFloat(order.price * order.executedQty) / 1000,
						})
					}
					return res(obj.trades)
				}));
			}
		}
		
		if (promises.length)
			await Promise.all(promises)

		let trades = []
		if (filters.symbol) 
			trades = assets.find(a => a.asset == filters.coin).trades // .find(base)
		else {
			for (let i=0; i<assets.length; i++)
				this.trades = this.trades.concat(assets[i].trades)
			trades = this.trades
		}
		
		delete filters.symbol
		delete filters.coin
		delete filters.base
		return trades.filter(t => {
			if (!t.quantity)
				return false
			for (field in filters) {
				if (t[field] != filters[field]) {
					return false
				}
			}
			return true
		})
		.sort((a,b) => { return a.time > b.time ? 1 : -1 })
	},
	async myFilledBuys(filters) 
	{
		filters = { ...filters || {}, side: 'BUY'/*, status: 'FILLED'*/ }
		//if (!this.trades.length)
			this.filledBuys = await this.myTrades(filters)

		return this.filledBuys
	},
	async myFilledSells(filters) 
	{
		filters = { ...filters || {}, side: 'SELL'/*, status: 'FILLED'*/ }
		//if (!this.trades.length)
			this.filledSells = await this.myTrades(filters)

		return this.filledSells
	},
	async myFilledTrades(filters) 
	{
		filters = { ...filters || {}/*, quantity: 0*/ }
		//if (!this.trades.length)
		this.filledTrades = await this.myTrades(filters)

		return this.filledTrades
	},
}

module.exports = myBinance
