let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');

// Plantilla o estructura
let schema = new Schema({
    name: { 
        type: String, required: true,
        min: 3, max: 255,
    },
    email: { 
        type: String, required: true,
        min: 6, max: 255
    },
    password: { 
        type: String, required: true, 
        min: 6, max: 1024
    },
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