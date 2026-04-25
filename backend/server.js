require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')

const app = express()

// ── CORS ────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,           // set this in Render env vars to your Vercel URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

// ── Body Parsing ────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health Check ────────────────────────────────────
// Render pings this to check if the server is alive
app.get('/', (req, res) => {
  res.json({
    status:  'ok',
    message: 'Eventlink API is running',
    version: '1.0.0',
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// ── Routes ──────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/events',    require('./routes/events'))
app.use('/api/bookings',  require('./routes/bookings'))
app.use('/api/payments',  require('./routes/payments'))
app.use('/api/users',     require('./routes/users'))
app.use('/api/admin',     require('./routes/admin'))
app.use('/api/validator', require('./routes/validator'))

// ── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` })
})

// ── Global Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// ── DB + Start ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('DB connection failed:', err)
    process.exit(1)
  })