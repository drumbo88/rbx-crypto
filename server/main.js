require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
//const session = require('express-session');
//const passport = require('passport');
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
//const MongoStore = require('connect-mongo')(session);

const app = express()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Conecta con la Base de Datos
mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });

// Carga passport y las estrategias configuradas
//require('./config/passport');

// Middlewares
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/*app.use(session({ 
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: process.env.SESSION_AGE_MINS * 60 * 1000 }
}));*/
//app.use(passport.initialize());
//app.use(passport.session());

// Routes
const users = require('./routes/api/users.js')
const profile = require('./routes/api/profile.js')
const markets = require('./routes/api/markets.js')
const trades = require('./routes/api/trades.js')
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/markets', markets)
app.use('/api/trades', trades)

// Inicia el servidor en el puerto especificado
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Servidor iniciado en puerto ${port}`))
