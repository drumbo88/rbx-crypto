let myBinance = require('./../../config/my-binance.js')

async function myBinanceClient(req, res, next) {
	try {
		let time = await myBinance.time()
		myBinance.res = { time }
		return next()
	}
	catch (err) {
		return res.status(500).json("No se pudo conectar con Binance: "+err)
	}
}

module.exports = myBinanceClient
