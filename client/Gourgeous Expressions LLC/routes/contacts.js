import express from 'express';
import debug from 'debug';
import Joi from 'joi';
import {
    GetAllContacts,
    SaveContacts
} from '../database.js';
import {
    validBody
} from '../middleware/validBody.js';
import {
    sendEmail
} from './emailService.js';
const debugContacts = debug("app:Contacts");
const router = express.Router();

const contactSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    serviceType: Joi.string().valid(
        "Eyebrow Lamination",
        "Eyebrow Tint & Waxing",
        "Brazilian Waxing",
        "Full Body Waxing",
        "Skincare & Facials",
        "Vajacials"
    ).required(),
    message: Joi.string().max(500).optional()
});



//Get All Contact Forms//
router.get("/", async (req, res) => {
    try {
        const contacts = await GetAllContacts();
        debugContacts(contacts);
        res.status(200).json(contacts);
    } catch (error) {
        debugContacts(error.message);
        res.status(500).json({
            error: error.message
        });
    }

});


// Post Contact Form Route
router.post('/submit', validBody(contactSchema), async (req, res) => {
    const {
        name,
        email,
        phone,
        serviceType,
        message
    } = req.body;

    try {
        // Save the contact message in the database
        await SaveContacts({
            name,
            email,
            phone,
            serviceType,
            message,
            date: new Date()
        });
        debugContacts("Your message has been saved successfully!");

        // Send email to the client (confirmation)
        await sendEmail(
            email,
            'Message Received - Gorgeous Expressions LLC',
            `
    Dear ${name},

    Thank you for reaching out to Gorgeous Expressions LLC! 

    We have successfully received your message and will respond to your inquiry as soon as possible. Your time and interest are greatly valued, and we're eager to assist you.

    Here are the details you provided:
    - **Name**: ${name}
    - **Phone**: ${phone}
    - **Service Requested**: ${serviceType}
    - **Message**: ${message || "No additional message provided."}

    If you have additional questions, feel free to reply to this email.

    Best regards,  
    The Gorgeous Expressions LLC Team
    `
        );

        // Send email to the business owner (notification)
        const ownerEmail = "Gorgeousexpressions1@gmail.com";
        await sendEmail(
            ownerEmail,
            'New Consultation Request - Gorgeous Expressions LLC',
            `
    You have received a new consultation request via the Gorgeous Expressions LLC website. Below are the details:

    - **Name**: ${name}
    - **Email**: ${email}
    - **Phone**: ${phone}
    - **Service Requested**: ${serviceType}
    - **Message**: 
      ${message || "No additional message provided."}

    Please follow up with the client as soon as possible.

    Best regards,  
    Gorgeous Expressions LLC Notification System
    `
        );

        res.status(200).json({
            message: "Your message has been saved and a confirmation email has been sent!"
        });

    } catch (error) {
        debugContacts("Error processing contact request:", error.message);
        res.status(500).json({
            error: "Failed to save message and send emails. Please try again later."
        });
    }
});


export {
    router as contactRouter
};
