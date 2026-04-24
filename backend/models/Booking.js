const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  paid:      { type: Boolean, default: false },

  // Razorpay
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paidAt:            { type: Date },

  // QR
  qrHash:    { type: String },          // SHA-256 hash stored in DB + on-chain
  qrDataUrl: { type: String },          // base64 PNG for display/download
  validated: { type: Boolean, default: false },
  validatedAt: { type: Date },

  // Blockchain
  txHash:    { type: String },          // Ethereum transaction hash
  blockNumber: { type: Number },
}, { timestamps: true })

// Prevent duplicate bookings
BookingSchema.index({ user: 1, event: 1 }, { unique: true })

module.exports = mongoose.model('Booking', BookingSchema)
