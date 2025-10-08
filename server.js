require('dotenv').config();
const express = require('express');
const { Resend } = require('resend');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api-key', (req, res) => {
    res.json({ apiKey: API_KEY });
});

// Email sending route
app.post('/send-email', async (req, res) => {
    // FROM field ko request se extract karo
    const { from, to, subject, message } = req.body;

    // FROM field ko bhi check karo
    if (!from || !to || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required: from, to, subject, message' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from, // Yahan 'from' ko use karo
            to: [to],
            subject: subject,
            html: message
        });

        if (error) {
            console.error('Error sending email:', error);
            return res.status(400).json({ error: 'Failed to send email', details: error });
        }

        res.status(200).json({ message: 'Email sent successfully!', data });
    } catch (error) {
        console.error('Critical error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});


// API endpoint for external websites
app.post('/api/send-email', async (req, res) => {
    const { apiKey, fromEmail, recipientEmail, emailSubject, emailMessage } = req.body;

    if (apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    if (!fromEmail || !recipientEmail || !emailSubject || !emailMessage) {
        return res.status(400).json({ error: 'All fields are required: fromEmail, recipientEmail, emailSubject, emailMessage' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [recipientEmail],
            subject: emailSubject,
            html: emailMessage
        });

        if (error) {
            console.error('Error sending email via API:', error);
            return res.status(400).json({ error: 'Failed to send email via API', details: error });
        }

        res.status(200).json({ message: 'Email sent successfully via API!', data });
    } catch (error) {
        console.error('Critical error via API:', error);
        res.status(500).json({ error: 'Failed to send email via API', details: error.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});