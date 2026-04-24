require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')

const app = express()

// ── Middleware ──────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ──────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/events',    require('./routes/events'))
app.use('/api/bookings',  require('./routes/bookings'))
app.use('/api/payments',  require('./routes/payments'))
app.use('/api/users',     require('./routes/users'))
app.use('/api/admin',     require('./routes/admin'))
app.use('/api/validator', require('./routes/validator'))

// ── DB + Start ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    )
  })
  .catch(err => { console.error('DB connection failed:', err); process.exit(1) })
