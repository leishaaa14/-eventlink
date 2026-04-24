const User    = require('../models/User')
const Event   = require('../models/Event')
const Booking = require('../models/Booking')

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [users, bookings, paid] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ paid: true }).populate('event', 'fee'),
    ])

    const revenue = paid.reduce((sum, b) => sum + (b.event?.fee || 0), 0)

    // Chart: registrations per event
    const events = await Event.find()
    const chartData = await Promise.all(
      events.map(async e => ({
        name:  e.name.length > 14 ? e.name.slice(0, 14) + '…' : e.name,
        count: await Booking.countDocuments({ event: e._id, paid: true }),
      }))
    )

    res.json({ users, bookings, revenue, chartData })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp').sort('-createdAt')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/admin/events
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id)
    res.json({ message: 'Event deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
