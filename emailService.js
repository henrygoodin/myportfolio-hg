import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    debug: true, // Enable SMTP debugging
    logger: true  // Log messages to console
});


// Function to send email
export const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"HGWebsitesLLC" <${process.env.GMAIL_USER}>`, // sender address
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
