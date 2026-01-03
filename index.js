const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

/* ================================
   HEALTH CHECK (VERY IMPORTANT)
================================ */
app.get("/", (req, res) => {
  res.json({ status: "Mailer API is running" });
});

/* ================================
   GMAIL SMTP TRANSPORT
================================ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // must be false for 587
  auth: {
    user: process.env.GMAIL_USER, // your gmail
    pass: process.env.GMAIL_PASS, // app password
  },
});

/* ================================
   SEND EMAIL ENDPOINT
================================ */
app.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  // Validate input
  if (!to || !subject || !message) {
    return res.status(400).json({
      error: "Missing fields",
      required: ["to", "subject", "message"],
    });
  }

  try {
    // ⏳ WAIT until Gmail confirms send
    const info = await transporter.sendMail({
      from: `"Mailer API" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    // ✅ Success
    res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
    });
  } catch (err) {
    console.error("EMAIL ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
