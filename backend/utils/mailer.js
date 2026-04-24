const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,   // use Gmail App Password, not your real password
  },
})

/**
 * Send a 6-digit OTP to the user's email
 * @param {string} to    - recipient email
 * @param {string} otp   - 6-digit code
 */
exports.sendOTP = async (to, otp) => {
  await transporter.sendMail({
    from:    `"Eventlink" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your Eventlink verification code',
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <h2 style="color:#7c5cbf;margin-bottom:8px">Verify your email</h2>
        <p style="color:#555;margin-bottom:24px">Use the code below to complete your Eventlink signup. It expires in 10 minutes.</p>
        <div style="font-size:2.5rem;font-weight:900;letter-spacing:0.5em;color:#1a1a24;background:#fff;padding:20px;border-radius:8px;text-align:center;border:1px solid #e0e0e0">
          ${otp}
        </div>
        <p style="color:#999;font-size:0.8rem;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })
}

/**
 * Send a payment confirmation email with QR code attached
 * @param {string} to         - recipient email
 * @param {string} eventName  - name of the event
 * @param {string} qrDataUrl  - base64 PNG data URL of the QR code
 */
exports.sendPaymentConfirmation = async (to, eventName, qrDataUrl) => {
  // Strip the data URL prefix to get raw base64
  const base64 = qrDataUrl.replace(/^data:image\/png;base64,/, '')

  await transporter.sendMail({
    from:    `"Eventlink" <${process.env.MAIL_USER}>`,
    to,
    subject: `Registration confirmed: ${eventName}`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <h2 style="color:#7c5cbf;margin-bottom:8px">You're registered! 🎉</h2>
        <p style="color:#555;margin-bottom:8px">Your registration for <strong>${eventName}</strong> is confirmed.</p>
        <p style="color:#555;margin-bottom:24px">Show the QR code below at the event entry for instant check-in.</p>
        <div style="text-align:center;background:#fff;padding:16px;border-radius:8px;border:1px solid #e0e0e0">
          <img src="cid:qrcode" alt="Your QR Code" width="200" height="200" />
        </div>
        <p style="color:#999;font-size:0.8rem;margin-top:24px">This QR code is unique to you. Do not share it.</p>
      </div>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        content:  base64,
        encoding: 'base64',
        cid:      'qrcode',
      },
    ],
  })
}
