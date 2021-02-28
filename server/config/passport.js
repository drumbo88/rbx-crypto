var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

// Le dice a passport cómo almacenar el usuario en la sesión
passport.serializeUser(function (user, done) {
    done(null, user.id); // Serializa por ID
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
})

// Definición de estrategia local para alta de usuario
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
   User.findOne({email:email}, function (err, user) {
        // Si hubo error, lo devuelvo
        if (err) 
            return done(err);
        // Si encuentro usuario ya existente, lo informo
        if (user) 
            return done(null, false, {message: 'El email ya está en uso.'}) // arg2: mensaje flash
        
        // Si pasó los chequeos, está ok y creo el usuario.
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function (err, result) {
            if (err)
                return done(err);
            return done(null, newUser);
        })
    })
}))

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({email:email}, function (err, user) {
        // Si hubo error, lo devuelvo
        if (err) 
            return done(err);
        // Si no encuentro usuario, lo informo
        if (!user) 
            return done(null, false, {message: 'No se encontró el usuario.'}) // arg2: mensaje flash
        
        if (!user.validPassword(password))
            return done(null, false, {message: 'Contraseña incorrecta.'})

        return done(null, user);
    }
    )}
));
