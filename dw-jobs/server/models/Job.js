const m = require('mongoose');
const s = new m.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  address: String,                       // owner's work-site address / landmark
  wage: { type: Number, required: true },   // per day
  geo: {                                 // GeoJSON: coordinates = [longitude, latitude]
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  employer: { type: m.Schema.Types.ObjectId, ref: 'User' },
  open: { type: Boolean, default: true }
}, { timestamps: true });
s.index({ geo: '2dsphere' });
module.exports = m.model('Job', s);
