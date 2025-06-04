require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Verify environment variables are loaded
console.log('Email configuration:', {
    user: 'fadhilimumo3673@gmail.com',
    pass: process.env.EMAIL_PASSWORD ? 'Password is set' : 'Password is missing'
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fadhilimumo3673@gmail.com',
        pass: process.env.EMAIL_PASSWORD // This should be your 16-character App Password
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter verification error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Simple contact endpoint
app.post('/api/contact', async (req, res) => {
    try {
        await transporter.sendMail({
            from: `"Portfolio Contact" <fadhilimumo3673@gmail.com>`,
            to: 'fadhilimumo3673@gmail.com',
            replyTo: req.body.email,
            subject: `Portfolio Message: ${req.body.subject}`,
            html: `
                <h3>New Message from Portfolio</h3>
                <p><b>From:</b> ${req.body.name} (${req.body.email})</p>
                <p><b>Subject:</b> ${req.body.subject}</p>
                <p><b>Message:</b></p>
                <p>${req.body.message}</p>
            `
        });
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 