var express = require('express');
var router = express.Router();
var { check, validationResult } = require('express-validator');

var cors = require('cors');
var whitelist = ['http://localhost:8080']
var corsOptions = {
    cookie: true,    
    /*origin: function (origin, callback) {
        console.log(origin)
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }*/
}
var csrfProtection = cors(corsOptions);

router.use(csrfProtection);

var url = require('url');
//var passport = require('passport');
/*
router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('user/profile', { userEmail: req.user.email });
});

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout();
  res.redirect('/');
});

// Especifica que para todas las rutas siguientes, usará el middleware isNotLoggedIn
router.use('/', isNotLoggedIn, function (req, res, next) {
  next();
})
*/
router.get('/signup', function (req, res, next) {
    res.json({
        csrfToken: '' //req.csrfToken()
    });
});
router.get('/signin', function (req, res, next) {
  res.send({
      csrfToken: '' //req.csrfToken()
  });
});
/*
router.post('/signup', 
  [
    check('email').notEmpty().withMessage('Ingrese email').isEmail().withMessage('Email inválido'),
    check('password').notEmpty().withMessage('Ingrese password').isLength({min:6}).withMessage('Password muy corto')
  ],
  function (req, res, next) {
    var errors = validationResult(req).errors; //validationResult(req);
    if (errors.length > 0) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        //console.log(errors);
        //req.flash('error', messages);
        return res.json({ errors: messages }) 
        ///.redirect('/api/users/signup'); //done(null, false, req.flash('error', messages))
    }
    next();
  },
  passport.authenticate('local.signup', {
    successRedirect: '/api/users/profile',
    failureRedirect: '/api/users/signup',
    failureFlash: true,
  })
);

router.get('/signin', function (req, res, next) {
    res.send({
        csrfToken: '' //req.csrfToken()
    });
});

router.post('/signin', 
  passport.authenticate('local.signin', {
    //successRedirect: '/user/profile',
    failureRedirect: '/api/users/signin',
    badRequestMessage: 'Complete todos los campos',
    failureFlash: true,
  }), 
  function (req, res, next) { // Al loguearse
    if (req.session.oldReqUrl) {
      var oldReqUrl = req.session.oldReqUrl
      req.session.oldReqUrl = null
      var oldReqBodyMessage = req.session.oldReqBodyMessage
      req.session.oldReqBodyMessage = null
      return res.render('shop/checkout-stripe')
    }
  }
)
/* router.post('/signin', function (req, res, next) { 
  passport.authenticate('local.signin', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    badRequestMessage: 'Complete todos los campos',
    failureFlash: true,
  }, function (err, user) {
    req.session.user = user;
  })(req, res, next) 
})
 */
module.exports = router;
/*
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next()
  res.json({ loggedIn: true })
}
function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated())
    return next()
  res.json({ loggedIn: false })
}*/