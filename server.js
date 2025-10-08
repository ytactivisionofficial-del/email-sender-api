require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api-key', (req, res) => {
    res.json({ apiKey: API_KEY });
});

// Email sending route
app.post('/send-email', async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required: to, subject, message' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: message // Use html for rich text/HTML content
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

// API endpoint for external websites
app.post('/api/send-email', async (req, res) => {
    const { apiKey, recipientEmail, emailSubject, emailMessage } = req.body;

    if (apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    if (!recipientEmail || !emailSubject || !emailMessage) {
        return res.status(400).json({ error: 'All fields are required: recipientEmail, emailSubject, emailMessage' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: emailSubject,
            html: emailMessage
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully via API!' });
    } catch (error) {
        console.error('Error sending email via API:', error);
        res.status(500).json({ error: 'Failed to send email via API', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
