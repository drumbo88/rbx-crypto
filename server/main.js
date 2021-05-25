require('dotenv').config();
Error.stackTraceLimit = 1 //Infinity;

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session');
//const csrf = require('passport');
const cors = require('cors');
//const csrf = require('csurf');
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
//const MongoStore = require('connect-mongo')(session);

const app = express()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, csrf-token, X-Requested-With, Content-Type, Accept");
  next();
});
// Conecta con la Base de Datos
mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
.then((x) => {
  const conn = x.connections[0]
  console.log(`-> Base de datos '${conn.name}' en '${conn.host}:${conn.port}' conectada\n`)
})
.catch((x) => console.log('X> Error conectando la BD\n', x))

// Middlewares
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}))

// Configuraciones básicas de servidor Express
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())

// Rutas públicas
app.use('/api/auth', require('./routes/api/auth.js'))
app.use('/api/tickers', require('./routes/api/tickers.js'))

// Protección de rutas
app.use(require('./routes/middlewares/jwt.js'))
app.use(require('./routes/middlewares/binance.js'))
app.use('/api/users', require('./routes/api/users.js'))
app.use('/api/wallet', require('./routes/api/wallet.js'))
app.use('/api/profile', require('./routes/api/profile.js'))
app.use('/api/trades', require('./routes/api/trades.js'))
app.use((req, res, next) => {
  res.status(404)
console.log('Not Found 404')
  // respond with html page
  /*if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }*/

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// Inicia el servidor en el puerto especificado
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`-> Servidor iniciado en puerto ${port}\n`))
