const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://irraspaces.com",     // ✅ your custom frontend
  "https://www.irraspaces.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json()); // Parse JSON requests

// ✅ Test route
app.get("/api", (req, res) => {
  res.send("🚀 Backend is running!");
});

// ✅ Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  console.log("📩 Contact form received:", { name, email, phone, message });

  try {
    // ✅ Transporter (GoDaddy SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtpout.secureserver.net",
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // fixes SSL issues with GoDaddy
      },
    });

    // ✅ Email to Admin
    await transporter.sendMail({
      from: `"Irra Spaces" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      replyTo: email,
    });

    // ✅ Confirmation email to Client
    await transporter.sendMail({
      from: `"Irra Spaces" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting Irra Spaces!",
      text: `Hello ${name},\n\n Thank you for reaching out to Irra Spaces. We have received your message:\n"${message}"\n\nOur team will get back to you shortly.\n\nBest regards,\nIrra Spaces`,
    });

    res.json({ success: true, message: "✅ Message sent successfully." });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res
      .status(500)
      .json({ success: false, error: "Could not send message. Try later." });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
