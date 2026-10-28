const m = require('mongoose');
const s = new m.Schema({
  job: { type: m.Schema.Types.ObjectId, ref: 'Job' },
  worker: { type: m.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });
s.index({ job: 1, worker: 1 }, { unique: true });
module.exports = m.model('Application', s);
