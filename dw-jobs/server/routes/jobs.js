const r = require('express').Router(), Job = require('../models/Job'), App = require('../models/Application');
const { auth, role } = require('../middleware/auth');

// Jobs within `radius` km (default 10) of the worker, nearest first
r.get('/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  const km = Math.min(parseFloat(req.query.radius) || 10, 50);
  if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ msg: 'lat and lng required' });
  const query = { open: true };
  if (req.query.category) query.category = req.query.category;
  const jobs = await Job.aggregate([{ $geoNear: {
    near: { type: 'Point', coordinates: [lng, lat] },
    distanceField: 'distance', maxDistance: km * 1000, spherical: true, query } }]);
  await Job.populate(jobs, { path: 'employer', select: 'name phone' });
  res.json(jobs.map(j => ({ ...j, distanceKm: +(j.distance / 1000).toFixed(1) })));
});

r.post('/', auth, role('employer'), async (req, res) => {
  const { title, description, category, address, wage, lat, lng } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ msg: 'Location required' });
  res.json(await Job.create({ title, description, category, address, wage,
    geo: { type: 'Point', coordinates: [Number(lng), Number(lat)] }, employer: req.user.id }));
});
r.get('/mine', auth, role('employer'), async (req, res) =>
  res.json(await Job.find({ employer: req.user.id }).sort('-createdAt')));
r.get('/:id/applicants', auth, role('employer'), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, employer: req.user.id });
  if (!job) return res.status(404).json({ msg: 'Not found' });
  res.json(await App.find({ job: job._id }).populate('worker', 'name phone address'));
});
module.exports = r;
