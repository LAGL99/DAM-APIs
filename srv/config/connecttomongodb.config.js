//import mongoose from 'mongoose'; 

const { requires } = require('@sap/cds');
const mongoose = require( 'mongoose');

const dotenvxconfig = require('./dotenvx.config'); 

(async () => { 
    try { 
        const db = await mongoose.connect(dotenvxconfig.CONNECTION_STRING, { 
            //useNewUrlParser: true, 
            //useUnifiedTopology: true, 
            dbName: dotenvxconfig.DATABASE 
        }); 
        console.log('Database is connected to: ', db.connection.name); 
    } catch (error) { 
        console.log('Error: ', error); 
    } 
})();