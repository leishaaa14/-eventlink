const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  category:    { type: String, enum: ['Technical', 'Non-Technical', 'Workshop'], required: true },
  department:  { type: String, required: true },
  location:    { type: String, required: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },
  fee:         { type: Number, required: true, min: 0 },
  teamSize:    { type: Number, default: 1 },
  emoji:       { type: String, default: '🎪' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Event', EventSchema)
