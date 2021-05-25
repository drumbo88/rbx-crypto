var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var User = require('../../models/User')

/**
 *	Procesar Alta de Usuario
 */
 router.post('/signup', async (req, res, next) =>
 {
     // <Procesamiento>
     try {
         // <ValidarInputs />
         const existeEmail = await User.findOne({ email: req.body.email })
         if (existeEmail)
             return res.json({ error: 'Email ya registrado.'})
 
         const coincidePassword = req.body.password != req.body.confirmPassword
         if (coincidePassword)
             return res.json({ error: 'Los passwords ingresados no coinciden.'})
 
         // <EncriptarContraseña />
         const salt = await bcrypt.genSalt(10)
         const password = await bcrypt.hash(req.body.password, salt)
         
         // <CrearUsuarioModelo />
         const user = new User({
             name: req.body.name,
             email: req.body.email,
             password: password,
         })
 
         // <GuardarUsuarioEnBD />
         const userDb = await user.save()
 
         // <GenerarTokenAutenticacion />
         const token = jwt.sign({
             id: user._id,
             name: user.name
         }, process.env.JWT_SECRET)
     
         // <RetornarDatosEnRespuesta />
         res.json({ user: userDb, authToken: token })
     }
     catch (err) {
         // <RetornaErrorDeSistemaEnRespuesta />
         console.log(err)
         res.status(500).json({ error: err.message })
     }
     // </Procesamiento>
 })
 
 /**
  *	Obtener datos para Autenticación de Usuario
  */
 router.get('/signin', (req, res, next) => 
 {
     res.send({
     })
 })
 
 /**
  *	Procesar Autenticación de Usuario
  */
 router.post('/signin', async (req, res, next) =>
 {
     try  {
         // <ValidarInputs />
         // Buscar usuario
         const user = await User.findOne({ email: req.body.email })
 
         // Chequear contraseña
         if (!user || !await bcrypt.compare(req.body.password, user.password))
             return res.json({ error: "Credenciales inválidas" })
 
         // <GenerarTokenAutenticacion />
         const token = jwt.sign({
             id: user._id,
             name: user.name
         }, process.env.JWT_SECRET)
     
         // <RetornarDatosEnRespuesta />
         res.json({ user, authToken: token })
     }
     catch (err) {
         // <RetornaErrorDeSistemaEnRespuesta />
         res.status(500).json({ error: err.message })
     }
     // </Procesamiento>
 })

 module.exports = router