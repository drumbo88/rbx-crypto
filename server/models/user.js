var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Plantilla o estructura
var schema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
})

// Helper methods (métodos para el modelo User)
schema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}
schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

// Crea un modelo en base a esa plantilla
module.exports = mongoose.model('User', schema);