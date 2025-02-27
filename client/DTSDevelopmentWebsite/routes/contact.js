import express from 'express';
import debug from 'debug';
import Joi from 'joi';
import {
    getAllContacts,
    saveContactMessage
} from '../database.js';
//Other imports insert here//
import {
    validBody
} from '../middleware/validBody.js';
import { sendEmail } from './emailService.js';
const debugContact = debug('app:Contact');
const router = express.Router();

const contactFormSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().trim().required(),
    subject: Joi.string().required(),
    message: Joi.string().min(10).required()
});



//Get All Contact Forms//
router.get('/', async (req, res) => {
    try {
        const contacts = await getAllContacts();
        debugContact(contacts);
        res.status(500).json(contacts);
    } catch (error) {
        debugContact(JSON.stringify(error.message));
        res.status(500).json({
            error: error.message
        });
    }
});


//Add or send a contact request using post http method
router.post('/submit', validBody(contactFormSchema), async (req, res) => {
    const {
        name,
        email,
        subject,
        message
    } = req.body;
    try {
        //Create contact message object
        const contactMessage = {
            name,
            email,
            subject,
            message,
            date: new Date()
        };

        //Save the contact message in the database
        await saveContactMessage(contactMessage);

        // Send email to the user (confirmation)
        await sendEmail(
            email,
            'Message Received - DTS Development',
            `
    Dear ${name},

    Thank you for reaching out to DTS Development! 

    We have successfully received your message and will respond to your inquiry as soon as possible. Your time and interest are greatly valued, and we're eager to assist you.

    For your reference, here are the details you provided:
    - **Name**: ${name}
    - **Subject**: ${subject}
    - **Message**: ${message}

    If you have additional information or need further assistance in the meantime, please don't hesitate to contact us.

    Best regards,  
    The DTS Development Team
    `
        );

        // Send email to the CEO (notification)
        const ownerEmail = "Info@dtsdevelopments.com";
        await sendEmail(
            ownerEmail,
            'New Message Alert - DTS Development Website',
            `
    Dear CEO,

    You have received a new message via the DTS Development website. Below are the details:

    - **Sender Name**: ${name}
    - **Email**: ${email}
    - **Subject**: ${subject}
    - **Message**: 
      ${message}

    Kindly address this inquiry at your earliest convenience.

    Best regards,  
    DTS Development Notification System
    `
        );

        // Response to the client
        debugContact("Your message has been saved successfully!");
        res.status(200).json("Your message has been saved successfully!");

    } catch (error) {
        debugContact('Error saving contact message:', error.message);
        res.status(500).json({
            error: 'Failed to save message. Please try again later.',
        });
    }
});

export {
    router as contactRouter
};
