import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import debug from 'debug';
import { contactRouter } from './contact.js';

const debugServer = debug('app:Server');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:3000',       // Localhost frontend
    'http://127.0.0.1:5500',       // Live Server default
    'http://localhost:5500',       // Alternate Live Server default
    'https://myportfolio-hg.onrender.com' // Render frontend URL without trailing slash
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Allow cookies if needed
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Routes
app.use('/api/contacts/', contactRouter);

// Start server
app.listen(port, () => {
    debugServer(`Server is now running on http://localhost:${port}`);
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500; // Default to 500 if status is not set
    res.status(status).json({ error: err.message });
    debugServer(`Error occurred: ${err.message}`, err); // Log the entire error object
});
