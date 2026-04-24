const Razorpay = require('razorpay')
const crypto   = require('crypto')
const QRCode   = require('qrcode')
const Booking  = require('../models/Booking')
const Event    = require('../models/Event')
const { writeRegistrationToChain }   = require('../utils/blockchain')
const { sendPaymentConfirmation }     = require('../utils/mailer')

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
   console.log('createOrder hit', req.body, req.user?._id)
  try {
    const { eventId } = req.body
    const event = await Event.findById(eventId)
    if (!event) return res.status(404).json({ message: 'Event not found' })
      console.log('Razorpay keys:', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET ? 'SECRET OK' : 'SECRET MISSING')  // ADD THIS LINE

    // Create or fetch existing booking
    let booking = await Booking.findOne({ user: req.user._id, event: eventId })
    if (booking?.paid) return res.status(400).json({ message: 'Already registered for this event' })

    const order = await razorpay.orders.create({
      amount:   event.fee * 100,   // paise
      currency: 'INR',
      receipt:  `evt_${Date.now()}`,
    })

    if (!booking) {
      booking = await Booking.create({ user: req.user._id, event: eventId, razorpayOrderId: order.id })
    } else {
      booking.razorpayOrderId = order.id
      await booking.save()
    }

    res.json({ id: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    console.log('FULL ERROR:', err)  // ADD THIS
    res.status(500).json({ message: err.message })
  }
}

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { eventId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // 1. Verify Razorpay signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' })

    // 2. Find booking
    const booking = await Booking.findOne({ user: req.user._id, event: eventId }).populate('event')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // 3. Generate SHA-256 QR hash (paymentId + userId + eventId + timestamp)
    const qrHash = crypto
      .createHash('sha256')
      .update(`${razorpay_payment_id}:${req.user._id}:${eventId}:${Date.now()}`)
      .digest('hex')

    // 4. Generate QR code PNG (data URL)
    const qrDataUrl = await QRCode.toDataURL(qrHash, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })

    // 5. Write hash to blockchain (non-blocking — fire and forget style, save tx later)
    let txHash = null
    try {
      const tx = await writeRegistrationToChain(qrHash, req.user._id.toString(), eventId)
      txHash = tx.hash
    } catch (chainErr) {
      console.warn('Blockchain write skipped:', chainErr.message)
    }

    // 6. Save everything to MongoDB
    booking.paid               = true
    booking.razorpayPaymentId  = razorpay_payment_id
    booking.razorpaySignature  = razorpay_signature
    booking.paidAt             = new Date()
    booking.qrHash             = qrHash
    booking.qrDataUrl          = qrDataUrl
    booking.txHash             = txHash
    await booking.save()

    // 7. Send confirmation email with QR attached (non-blocking)
    sendPaymentConfirmation(req.user.email, booking.event?.name, qrDataUrl)
      .catch(e => console.warn('Email send failed:', e.message))

    res.json({ message: 'Payment verified. QR code generated.', qrHash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
