require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const app = express();
app.use(cors()); app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch(e => console.error('DB error', e));
