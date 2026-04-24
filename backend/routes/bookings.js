// routes/bookings.js
const express = require('express')
const router  = express.Router()
const Booking = require('../models/Booking')
const { protect } = require('../middleware/auth')

router.get('/mine', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort('-createdAt')
    res.json(bookings)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
