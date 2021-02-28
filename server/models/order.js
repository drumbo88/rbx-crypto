var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Plantilla o estructura
var schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Refers to the User model
    cart: { type: Object, required: true },
    //address: { type: String, required: true },
    //name: { type: Number, required: true },
    onlinePaymentProvider : { type: String },
    paymentId : { type: String, required: true },
    datetime : { type: Date, required: true },
})

// Crea un modelo en base a esa plantilla
module.exports = mongoose.model('Order', schema);