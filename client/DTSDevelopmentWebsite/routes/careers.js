import express from 'express';
import debug from 'debug';
import Joi from 'joi';
import multer from 'multer';
import { sendEmail } from './emailService.js';
import { validBody } from '../middleware/validBody.js';
import { saveCareerApplication, getAllApplications } from '../database.js';

const debugCareers = debug('app:Careers');
const router = express.Router();

// Multer Storage Configuration (Uploads to 'uploads/resumes' directory)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File Upload Middleware (Only PDFs Allowed)
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Validation Schema (Similar to Contact Form)
const careerFormSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().trim().required(),
    message: Joi.string().min(10).required()
});

// Get All Applications
router.get('/', async (req, res) => {
    try {
        const applications = await getAllApplications();
        debugCareers(applications);
        res.status(200).json(applications);
    } catch (error) {
        debugCareers(error.message);
        res.status(500).json({ error: error.message });
    }
});

// Handle Career Application Form Submission (With File Upload)
router.post('/submit', upload.single('resume'), validBody(careerFormSchema), async (req, res) => {
    const { name, email, message } = req.body;
    const resumePath = req.file ? req.file.path : null; // Store resume path if uploaded

    try {
        // Create application object
        const careerApplication = {
            name,
            email,
            message,
            resume: resumePath,
            date: new Date()
        };

        // Save application in database
        await saveCareerApplication(careerApplication);

        // Send confirmation email to applicant
        await sendEmail(
            email,
            'Application Received - DTS Development',
            `
    Dear ${name},

    Thank you for applying at DTS Development! 

    We have successfully received your application. If needed, our team will review your details and reach out for further steps.

    Your Details:
    - **Name**: ${name}
    - **Message**: ${message}
    ${resumePath ? "- Resume: Attached" : "- No Resume Uploaded"}

    Best regards,  
    DTS Development Team
    `
        );

        // Notify CEO about the new application
        const ownerEmail = "Info@dtsdevelopments.com";
        await sendEmail(
            ownerEmail,
            'New Job Application Received - DTS Development',
            `
    Dear CEO,

    A new job application has been submitted via the DTS Development website.  

    Applicant Details:
    - **Name**: ${name}
    - **Email**: ${email}
    - **Message**: 
      ${message}
    ${resumePath ? `- Resume: File uploaded at ${resumePath}` : "- No Resume Uploaded"}

    Please review the application at your earliest convenience.

    Best regards,  
    DTS Development Notification System
    `
        );

        res.status(200).json("Your application has been submitted successfully!");
    } catch (error) {
        debugCareers('Error submitting application:', error.message);
        res.status(500).json({ error: 'Failed to submit application. Please try again later.' });
    }
});

export { router as careersRouter };
