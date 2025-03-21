import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import {
    contactRouter
} from './routes/contacts.js';
import cors from "cors";
import debug from "debug";
const debugServer = debug("app:Server");

const app = express();
const port = process.env.PORT || 3202;

//Middleware
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('frontend/dist'));

const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

app.use(cors({
    origin: (origin, callback) => {
        console.log("Incoming request from origin:", origin); // Debugging
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`); // Debugging
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'], // Ensure preflight requests work
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));


// ✅ Handle preflight OPTIONS requests
app.options('*', cors());


//Routes
app.use('/api/contacts/', contactRouter);


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