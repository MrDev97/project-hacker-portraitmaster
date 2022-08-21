const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  user: { type: String, required: true },
  votes: { type: Array, required: false },
});

module.exports = mongoose.model('Voter', voterSchema);
