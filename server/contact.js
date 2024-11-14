import express from 'express';
import debug from 'debug';
import Joi from 'joi';
import { sendEmail } from './emailService.js';
import { validBody } from './validBody.js';

const debugContact = debug('app:Contact');
const router = express.Router();

const contactFormSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().trim().required(),
    subject: Joi.string().required(),
    message: Joi.string().min(10).required()
});

router.post('/submit', validBody(contactFormSchema), async (req, res) => {
    const { name, email, subject, message } = req.body;
    debugContact('Contact Route Hit!!');

    try {
        // Log the message content for debugging
        debugContact('Message Details: ', { name, email, subject, message });

        // Send booking confirmation to customer (optional)
        const ownerEmail = "henrygoodin9@gmail.com"; // Owner email

        // Send email to the owner
        await sendEmail(
            ownerEmail,
            'New Contact Alert - HG Websites LLC',
            `
            Dear Henry,

            A new contact message has been sent to you! Below are the details:

            - **Client Name**: ${name}
            - **Subject**: ${subject}
            - **Client Message**: ${message}
            - **Email**: ${email}
            - **Date and Time**: ${new Date()}

            Please respond ASAP.

            Best regards,
            HG Websites LLC System
            `
        );
        debugContact('Email sent to owner successfully.');

        // Optionally, send confirmation email to the user (if needed)
        await sendEmail(
            email,
            'Thank you for reaching out - HG Websites LLC',
            `
            Dear ${name},

            Thank you for contacting us! We’ve received your message and will get back to you as soon as possible. Here’s a copy of your message:

            - **Subject**: ${subject}
            - **Message**: ${message}

            We look forward to speaking with you soon.

            Best regards,
            HG Websites LLC Team
            `
        );
        debugContact('Confirmation email sent to client.');

        // Respond to the client
        res.status(201).json({
            message: 'Your message has been saved successfully! We will contact you soon.'
        });
    } catch (error) {
        // Enhanced error handling
        debugContact('Error sending email:', error.message);
        res.status(500).json({
            error: 'Failed to send message. Please try again later.'
        });
    }
});

export { router as contactRouter };
