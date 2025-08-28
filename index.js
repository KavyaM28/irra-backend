const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// ✅ CORS setup (allow your domains)
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
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,   // from .env
      port: process.env.SMTP_PORT,   // from .env
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Irra Spaces" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL, 
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
