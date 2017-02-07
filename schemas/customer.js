const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  paid: {type: Boolean},
  releaseSigned: {type: Boolean},
  photos: [{type: Schema.Types.ObjectId, ref: 'photo'}]
});

const customer = mongoose.model('customer', customerSchema);

module.exports = customer;
