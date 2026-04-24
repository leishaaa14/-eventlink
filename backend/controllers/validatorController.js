const Booking = require('../models/Booking')

// POST /api/validator/scan
exports.scanQR = async (req, res) => {
  try {
    const { qrHash } = req.body
    if (!qrHash) return res.status(400).json({ message: 'No QR hash provided' })

    const booking = await Booking.findOne({ qrHash })
      .populate('user',  'name email college department')
      .populate('event', 'name date department')

    if (!booking)
      return res.status(404).json({ message: 'QR code not found — invalid or tampered' })

    if (!booking.paid)
      return res.status(400).json({ message: 'Payment not completed for this registration' })

    if (booking.validated)
      return res.status(400).json({ message: `Already checked in at ${booking.validatedAt?.toLocaleString()}` })

    // Mark as validated
    booking.validated   = true
    booking.validatedAt = new Date()
    await booking.save()

    res.json({
      userName:    booking.user?.name,
      userEmail:   booking.user?.email,
      college:     booking.user?.college,
      department:  booking.event?.department || booking.user?.department,
      eventName:   booking.event?.name,
      eventDate:   booking.event?.date,
      txHash:      booking.txHash,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
