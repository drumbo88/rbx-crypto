const jwt = require('jsonwebtoken')

const verifyJWToken = (req, res, next) => {
    let token = req.header('auth-token')

    if (!token)
        return res.status(401).json({ error: 'Acceso denegado' })

    token = token.replace('Bearer ', '')
    try {
        const isValidToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = isValidToken
        next()
    }
    catch (err) {
        res.status(400).json({ error: 'Token inválido ' })
    }
}

module.exports = verifyJWToken