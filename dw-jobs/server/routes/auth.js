const r = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User');
const sign = u => jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
r.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, address } = req.body;
    if (!name || !phone || !password || !role) return res.status(400).json({ msg: 'Missing fields' });
    const u = await User.create({ name, phone, role, address, password: await bcrypt.hash(password, 10) });
    res.json({ token: sign(u), user: { name: u.name, role: u.role } });
  } catch (e) { res.status(400).json({ msg: e.code === 11000 ? 'Phone already registered' : e.message }); }
});
r.post('/login', async (req, res) => {
  const u = await User.findOne({ phone: req.body.phone });
  if (!u || !(await bcrypt.compare(req.body.password, u.password))) return res.status(400).json({ msg: 'Invalid credentials' });
  res.json({ token: sign(u), user: { name: u.name, role: u.role } });
});
module.exports = r;
