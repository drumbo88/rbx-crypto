var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Plantilla o estructura
var schema = new Schema({
    imagePath: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
})

// Crea un modelo en base a esa plantilla
module.exports = mongoose.model('Product', schema);