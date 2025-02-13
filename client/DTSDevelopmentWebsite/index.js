import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import debug from 'debug';
const debugServer = debug('app:Server');
import { contactRouter } from './routes/contact.js';
import { careersRouter } from './routes/careers.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('frontend/dist'));

// ✅ Define allowed origins
const allowedOrigins = ['http://127.0.0.1:5500']; // Your frontend's URL

// ✅ Correct CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'], // Allow preflight OPTIONS request
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies if needed
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

// Routes
app.use('/api/contacts/', contactRouter);
app.use('/api/careers/', careersRouter);

// Start server
app.listen(port, () => {
    debugServer(`Server is now running on http://localhost:${port}`);
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
    debugServer(`Error occurred: ${err.message}`, err);
});
