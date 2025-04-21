import express from 'express';
import debug from 'debug';
import Joi from 'joi';
import {
    getAllConsultations,
    saveConsultations
} from '../database.js';
//Othert imports here//
import {
    validBody
} from '../middleware/validBody.js'
import {
    sendEmail
} from './emailService.js';

//Import Send Email Function Below//

const debugConsultation = debug('app:Consultations');
const router = express.Router();


const consultationSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().trim().required(),
    phone: Joi.string().pattern(/^[\d\s\+\(\)\-\.\,]+$/).required(), // Allows dashes, spaces, parentheses, and plus signs
    subject: Joi.string().min(1).required(),
    message: Joi.string().min(10).required()
});


router.get('/', async (req, res) => {
    try {
        const consultations = await getAllConsultations();
        debugConsultation(consultations);
        res.status(200).json(consultations);

    } catch (error) {
        debugConsultation(JSON.stringify(error.message));
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/submit', validBody(consultationSchema), async (req, res) => {
    const {
        name,
        email,
        phone,
        subject,
        message
    } = req.body;

    try {
        // Create a new consultation object
        const newConsultation = {
            name,
            email,
            phone,
            subject,
            message,
            createdAt: new Date()
        };

        // Save the new consultation to the database
        await saveConsultations(newConsultation);

        // Send confirmation email to the customer
        await sendEmail(
            email,
            'Consultation Request Confirmation - Fyre Fitness',
            `
Dear ${name},

Thank you for reaching out to Fyre Fitness!

We have successfully received your consultation request. Here are the details of your submission:

- Name: ${name}
- Phone: ${phone}
- Email: ${email}
- Subject: ${subject}
- Message: ${message}

We will review your inquiry and get back to you as soon as possible.

Thank you for choosing Fyre Fitness, and we look forward to connecting with you soon!

Best regards,  
The Fyre Fitness Team
            `
        );

        // Notify the business/owner (Fyre Fitness) about the new consultation request
        const ownerEmail = "lovefyrefitness@gmail.com"
        await sendEmail(
            ownerEmail,
            'New Consultation Request - Fyre Fitness',
            `
You’ve received a new consultation request through the Fyre Fitness website.

Consultation Details:

- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Subject: ${subject}
- Message: ${message}

Please follow up with the client as needed.

– Fyre Fitness System
            `
        );

        debugConsultation("Consultation saved and emails sent successfully.");
        res.status(200).json("Your consultation request has been successfully submitted!");

    } catch (error) {
        debugConsultation('Error processing consultation request:', error.message);
        res.status(500).json({
            error: 'Failed to process consultation request. Please try again later.',
        });
    }
});



export {
    router as consultationRouter
};