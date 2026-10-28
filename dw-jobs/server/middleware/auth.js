const jwt = require('jsonwebtoken');
exports.auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.user = jwt.verify(t, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ msg: 'Unauthorized' }); }
};
exports.role = r => (req, res, next) =>
  req.user.role === r ? next() : res.status(403).json({ msg: 'Forbidden' });
