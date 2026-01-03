const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

/* 🔹 Health / wake route */
app.get("/", (req, res) => {
  res.json({ status: "Mailer API is running" });
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/* 🔥 PRO ASYNC EMAIL ROUTE */
app.post("/send-email", (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // ✅ Respond immediately (no waiting)
  res.json({ success: true, queued: true });

  // 🔄 Send email in background
  transporter
    .sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message,
    })
    .then(() => {
      console.log("Email sent to:", to);
    })
    .catch((err) => {
      console.error("Email failed:", err.message);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
