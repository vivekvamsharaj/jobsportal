const m = require('mongoose');
module.exports = m.model('User', new m.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'employer'], required: true },
  address: String
}, { timestamps: true }));
