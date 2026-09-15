// access env variable
const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../util/import-mongo/.env') });

//dotenv.config();
//require('dotenv').config(); // this is more recommended and should place at 1st line

const express = require('express');
const app = express();
const router = express.Router();

// dont do following combinae
//const _app_ = require('express')();
//const _router_ = require('express').Router();

const connectToDatabase = require("../models/db");

// best practice is included both together
const bcryptjs = require('bcryptjs'); //  Registration 
const jwt = require('jsonwebtoken'); // woth bcrypt together for Login 

// checl user input
const { body, validationResult } = require('express-validator');

// log
//const pino = require('pino');
// Create a Pino logger instance, this must be outside any endpoint handling to avoid performance issue
//const logger = pino();  
//const logger = require('pino')(); // combined


const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const existingEmail  = await collection.findOne({email: req.body.email});

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        if(!existingEmail ){
            const newUser = await collection.insertOne({
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hash,
                createdAt: new Date(),
            });

            const payload = {
                user: {
                    id: newUser.insertedId,
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET);
            return res.status(200).json({authtoken, email});
        } else {
            return res.status(400).json({ message: "Email already exists" });
        }
    } catch (e) {
        // ADD THIS LINE TO SEE THE ACTUAL ERROR IN YOUR TERMINAL
        console.error("CRITICAL REGISTER ERROR:", e);
        
        // Pass the error message back to the client for debugging
        return res.status(500).json({ error: e.message || 'Internal server error' });
    }
});


module.exports = router;