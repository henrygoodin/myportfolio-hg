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
        //debugDb(dbUrl) - check to see if the connection is valid
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


async function getAllContacts() {
    try {
        const db = await connect();
        const contacts = await db.collection("Contacts").find({}).toArray();
        return contacts;
    } catch (error) {
        res.status(404).json({
            error: error.message
        });
    }
}


//Contact Form Functions
// Example saveContactMessage function
async function saveContactMessage(contactMessage) {
    try {
      const db = await connect(); // Ensure you have a connect function to your database
      const contacts = await db.collection('Contacts').insertOne(contactMessage);
      return contacts;
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
  }


export {
    connect,
    ping,
    getAllContacts,
    saveContactMessage
};