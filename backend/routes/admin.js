const express = require('express')
const router  = express.Router()
const { getStats, getUsers, createEvent, deleteEvent } = require('../controllers/adminController')
const { protect, requireRole } = require('../middleware/auth')

const adminOnly = [protect, requireRole('admin')]

router.get('/stats',        ...adminOnly, getStats)
router.get('/users',        ...adminOnly, getUsers)
router.post('/events',      ...adminOnly, createEvent)
router.delete('/events/:id',...adminOnly, deleteEvent)

module.exports = router
