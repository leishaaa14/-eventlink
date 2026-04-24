const express = require('express')
const router  = express.Router()
const { scanQR } = require('../controllers/validatorController')
const { protect, requireRole } = require('../middleware/auth')

router.post('/scan', protect, requireRole('validator', 'admin'), scanQR)

module.exports = router
