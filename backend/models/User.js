const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true },
  phone:       { type: String },
  college:     { type: String },
  department:  { type: String },
  role:        { type: String, enum: ['user', 'admin', 'validator'], default: 'user' },

  // OTP verification
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String },
  otpExpiry:   { type: Date },

  // KYC
  kycVerified: { type: Boolean, default: false },
  kycDocUrl:   { type: String },
  kycSubmittedAt: { type: Date },

  profilePic:  { type: String },
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', UserSchema)
