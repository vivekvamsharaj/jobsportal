const r = require('express').Router(), App = require('../models/Application');
const { auth, role } = require('../middleware/auth');
r.post('/:jobId', auth, role('worker'), async (req, res) => {
  try { res.json(await App.create({ job: req.params.jobId, worker: req.user.id })); }
  catch { res.status(400).json({ msg: 'Already applied' }); }
});
r.get('/mine', auth, role('worker'), async (req, res) =>
  res.json(await App.find({ worker: req.user.id }).populate('job')));
module.exports = r;
