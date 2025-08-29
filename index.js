const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// ✅ CORS setup (allow your domains)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://irra-frontend.onrender.com",
    "https://kavyam28.github.io",     // GitHub Pages
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
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

  console.log('📩 Contact form received:', name, email, phone, message);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtpout.secureserver.net", // GoDaddy SMTP
      port: process.env.SMTP_PORT || 465,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER, // hello@irraspaces.com
        pass: process.env.EMAIL_PASS  // password from GoDaddy
      }
    });

    // 1️⃣ Send email to Admin (you)
    await transporter.sendMail({
      from: `"Irra Spaces" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Contact from ${name}`,
      text: `📩 You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      replyTo: email
    });

    // 2️⃣ Send confirmation to Client (the person who filled form)
    await transporter.sendMail({
      from: `"Irra Spaces" <${process.env.EMAIL_USER}>`,
      to: email, // send to client
      subject: "Thank you for contacting Irra Spaces!",
      text: `Hello ${name},\n\nThank you for reaching out to Irra Spaces. We have received your message:\n\n"${message}"\n\nOur team will get back to you shortly.\n\nBest regards,\nIrra Spaces Team`
    });

    res.json({ message: "✅ Thank you for contacting us! We'll get back soon." });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Message could not be sent. Try again later." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
