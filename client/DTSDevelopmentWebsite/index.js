import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import debug from 'debug';
const debugServer = debug('app:Server');
import {
    contactRouter
} from './routes/contact.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('frontend/dist'));
app.use(cors()); //Enables Cors for all origins

app.use('*', cors()); //handles all OPTIONS request for preflight checks


//Routes
app.use('/api/contacts', contactRouter);


// Start server
app.listen(port, () => {
    debugServer(`Server is now running on http://localhost:${port}`);
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500; // Default to 500 if status is not set
    res.status(status).json({
        error: err.message
    });
    debugServer(`Error occurred: ${err.message}`, err); // Log the entire error object
});
