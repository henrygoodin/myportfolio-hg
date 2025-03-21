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
        //debugDb(dbUrl); //check to see if the connection is valid//
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

async function GetAllContacts() {
    try {
        const db = await connect();
        const consulations = await db.collection("Contacts").find({}).toArray();
        return consulations;
    } catch (error) {
        debugDb(error.message)
        res.status(404).json({
            error: error.message
        });

    }
}

async function SaveContacts(contact) {
    try {
        const db = await connect();
        const contacts = await db.collection('Contacts').insertOne(contact);
        return contacts;
    } catch (error) {
        debugDb(JSON.stringify(error.message));
        res.status(404).json({
            error: error.message
        });
    }
}


export {
    connect,
    ping,
    GetAllContacts,
    SaveContacts


}
