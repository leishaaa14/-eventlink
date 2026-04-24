const express = require('express')
const router  = express.Router()
const Event   = require('../models/Event')
const { protect } = require('../middleware/auth')

// GET /api/events
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort('-createdAt')
    res.json(events)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/events/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json(event)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
