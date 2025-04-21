import {
    MongoClient,
    ObjectId
} from "mongodb";
import * as dotenv from "dotenv";
import express from 'express';
dotenv.config();

import debug from 'debug';
const debugDb = debug('app:Database');


let _db = null;

async function connect() {
    if (!_db) {
        const dbUrl = process.env.MONGO_URL;
        //debugDb(dbUrl) //- check to see if the connection is valid
        const dbName = process.env.MONGO_DB_NAME;
        const client = await MongoClient.connect(dbUrl);
        _db = client.db(dbName);
        debugDb('connected.');
    }
    return _db;
}


async function ping() {
    const db = await connect();
    const pong = await db.command({
        ping: 1
    });
    debugDb(`Ping: ${JSON.stringify(pong)}`);
}

ping();


async function getAllConsultations() {
    try {
        const db = await connect();
        const consultations = await db.collection("Consultations").find({}).toArray();
        return consultations;
    } catch (error) {
        throw new Error(error.message); // Let the route handle the response
    }
};

async function saveConsultations(newConsultation) {
    try {
        const db = await connect();
        const consultation = await db.collection('Consultations').insertOne(newConsultation);
        return consultation;
    } catch (error) {
        throw new Error(error.message); //Let the route handle the response
    }
}


export {
    getAllConsultations,
    saveConsultations
}