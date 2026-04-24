const jwt        = require('jsonwebtoken')
const crypto     = require('crypto')
const User       = require('../models/User')
const { sendOTP } = require('../utils/mailer')

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, college, department } = req.body
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' })

    const otp      = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    const user = await User.create({ name, email, password, phone, college, department, otp, otpExpiry })
    await sendOTP(email, otp)

    res.status(201).json({ message: 'OTP sent to your email' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await User.findOne({ email })

    if (!user || user.otp !== otp || user.otpExpiry < new Date())
      return res.status(400).json({ message: 'Invalid or expired OTP' })

    user.isVerified = true
    user.otp        = undefined
    user.otpExpiry  = undefined
    await user.save()

    res.json({ message: 'Email verified. Please login.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    if (!user.isVerified)
      return res.status(401).json({ message: 'Please verify your email first' })

    const token = signToken(user._id)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, kycVerified: user.kycVerified }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
