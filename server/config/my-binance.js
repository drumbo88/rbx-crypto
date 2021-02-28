let Binance = require('binance-api-node').default

let binanceApi = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  useServerTime: true,
  recvWindow: 20000,
});

async function initMyBinance() {
	let time = await binanceApi.time()

	let myBinance = {
		api: binanceApi,
		time,
		balance: {
			totalBTC: 0,
			assets: [
				// { symbol: 'ETH', qty: 0, _totalBTC: 0 }
			],
		},
		prices: {
			// BASE_SYMBOL: { ... },
		},
		markets: {
			// BASE_SYMBOL: { ... },
		},
		trades: [],
		async parseRes(data) { 
			return { ...this.res, data: data || null, time: await this.api.time() }
		},
		async getPrices() { 
			// Get ticker prices
			ticker = await this.api.prices()
			
			this.prices = {}
			for ( let symbol in ticker ) 
				this.prices[symbol] = parseFloat(ticker[symbol]);

			return this.prices
		},
		async myBalance() 
		{
			this.prices = await this.getPrices()
			let accountInfo = await this.api.accountInfo()
			let balances = accountInfo.balances
			const FIELD_AVAILABLE = 'free'
			const FIELD_ON_ORDER = 'locked'
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

				if ( obj.usdTotal < 1) continue;
				this.totalBTC += obj.btcTotal;
				this.balance.assets.push(obj);
			}

			return this.balance
			/*await this.api.exchangeInfo((error, data) => 
			{
				if ( error ) console.error(error);
			
				.catch(error => console.error(error))
			})*/
		},
		
		async myTrades(filters) 
		{
			if (!this.balance.assets.length)
				await this.myBalance()

			if (filters.coin ^ filters.base)
				return console.error("Necesita ambos parámetros 'coin' y 'base'")

			if (filters.coin)
				filters.symbol = filters.coin + filters.base

			this.trades = []
			let promises = []
			let assets = this.balance.assets;
			for (let i=0; i<assets.length; i++)
			{
				if (!filters.symbol || filters.symbol == assets[i].nameTradeBTC)
				{
					promises.push(new Promise(async (res) => {
						let obj = assets[i]
						obj.trades = [] // RESETEA TRADES
						let orders = await this.api.allOrders({ symbol: obj.nameTradeBTC })
						for (let j=0; j<orders.length; j++) {
							let order = orders[j];
							/*if (order.side == 'BUY' && order.status == 'FILLED') {
								order.price = parseFloat(asset == 'BTC' ? order.price / this.prices.BTCUSDT : order.price)
								obj.buys.push({...})
							}*/
							obj.trades.push({
								time: order.time,
								//date: new Date(order.time),
								side: order.side,
								status: order.status,
								symbol: order.symbol,
								price: parseFloat(order.price),
								quantity: parseFloat(order.executedQty),
								totalPrice: order.price * order.executedQty,
								totalPriceUSD: order.price * order.executedQty * this.prices.BTCUSDT,
								commission: parseFloat(order.price * order.executedQty) / 1000,
							})
						}
						return res(obj.trades)
					}));
				}
			}
			
			console.log('yyy', promises.length)
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
			console.log(trades[0])
			return trades.filter(t => {
				for (field in filters) {
					if (t[field] != filters[field])
						return false
				}
				return true
			})
			.sort((a,b) => { return a.time > b.time ? 1 : -1 })
		},
		async myFilledBuys(filters) 
		{
			filters = { ...filters || {}, side: 'BUY', status: 'FILLED' }
			if (!this.trades.length)
				this.filledBuys = await this.myTrades(filters)

			return this.filledBuys
		},
		async myFilledSells(filters) 
		{
			filters = { ...filters || {}, side: 'SELL', status: 'FILLED' }
			if (!this.trades.length)
				this.filledSells = await this.myTrades(filters)

			return this.filledSells
		},
		async myFilledTrades(filters) 
		{
			filters = { ...filters || {}, status: 'FILLED' }
			if (!this.trades.length)
				this.filledTrades = await this.myTrades(filters)

			return this.filledTrades
		},
	}
	myBinance.res = { time }

	return myBinance
}

module.exports = initMyBinance
/*initMyBinance().then(myBinance => {
	try
	module.exports = myBinance
})//await binanceApi.time((res) => { time = let})*/