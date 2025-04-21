import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import debug from 'debug';
const debugServer = debug('app:Server');
 import {
    consultationRouter
} from './routes/consultation.js'; 

const app = express();
const port = process.env.PORT || 3205;

//Middleware
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('frontend/dist'));

// ✅ Define allowed origins
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`Blocked by CORS: ${origin}`); // Debugging
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'], // Ensure preflight requests work
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));


// ✅ Handle preflight OPTIONS requests
app.options('*', cors());


// Routes
app.use('/api/consultations', consultationRouter);


// Start server
app.listen(port, () => {
    debugServer(`Server is now running on http://localhost:${port}`);
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.log("Middleware reached before error handler.");
    res.status(status).json({
        error: err.message
    });
    debugServer(`Error occurred: ${err.message}`, err);
});
