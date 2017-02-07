const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
  filename: {type: String, required: true, unique: true},
  previewUrl: {type: String},
  owner: {type: String},
  selected: {type: Boolean, default: false},
  finalPhoto: {type: String},
  finalMime: {type: String},
});

const photo = mongoose.model('photo', photoSchema);

module.exports = photo;
