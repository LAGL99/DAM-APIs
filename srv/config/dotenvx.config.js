//import dotenvx from 'dotenvx';

const dotenvx = require('@dotenvx/dotenvx')

// mensajes en caso de que no funcione 
dotenvx.config();
//export default {

module.exports={
    HOST: process.env.HOST || 'NO ENCONTRE VARIABE DE ENTORNO',
    PORT: process.env.PORT || 'NO ENCONTRE PORT',
    API_URL: process.env.API_URL || '/api/v1',
    CONNECTION_STRING: process.env.CONNECTION_STRING || 'monb://localhost:27017/?servtionTimeoutMS=5000&connectTimeoutMS=10000', 
    DATABASE: process.env.DATABASE || 'db_default',  
    DB_USER: process.env.DB_PASSWORD || 'admin',  
    DB_PASSWORD: process.env.DB_USER || 'admin', 
}
