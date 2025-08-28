const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// ✅ CORS setup (live + local)
app.use(cors({
  origin: ["https://irraspaces.com", "http://localhost:3000"]
}));
app.use(express.json());

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ✅ Contact route
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log('📩 Contact form received:', name, email, message);

  try {
    // --- Setup email transporter for cPanel SMTP ---
    const transporter = nodemailer.createTransport({
      host: "mail.valourtechnologies.com",  // ✅ cPanel mail server
      port: 465,                    // or 587 if 465 doesn’t work
      secure: true,                 // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
      }
    });

    // --- Email options ---
    const mailOptions = {
      from: `"Irra Spaces" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL, 
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "✅ Thank you for contacting us! We'll get back soon." });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Message could not be sent. Try again later." });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
