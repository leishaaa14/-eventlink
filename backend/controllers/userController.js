const Booking = require('../models/Booking')

// GET /api/users/stats
exports.getStats = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
    res.json({
      total:  bookings.length,
      paid:   bookings.filter(b => b.paid).length,
      unpaid: bookings.filter(b => !b.paid).length,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/qrcodes
exports.getQRCodes = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id, paid: true })
      .populate('event', 'name date department')
      .select('qrHash qrDataUrl validated validatedAt event')

    const qrs = bookings.map(b => ({
      _id:        b._id,
      qrHash:     b.qrHash,
      qrDataUrl:  b.qrDataUrl,
      validated:  b.validated,
      eventName:  b.event?.name,
      eventDate:  b.event?.date,
      department: b.event?.department,
    }))

    res.json(qrs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
