import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,  // Use environment variable
        pass: process.env.GMAIL_APP_PASSWORD // Use environment variable
    }
});

// Function to send email
export const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"DTS Development LLC" <${process.env.GMAIL_USER}>`, // sender address
            to,                                                // list of receivers
            subject,                                           // Subject line
            text                                               // plain text body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};