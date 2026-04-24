const express = require('express')
const router  = express.Router()
const { getStats, getQRCodes } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

router.get('/stats',   protect, getStats)
router.get('/qrcodes', protect, getQRCodes)

module.exports = router
