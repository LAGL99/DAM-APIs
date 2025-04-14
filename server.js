const express = require('express')
const cds = require('@sap/cds')
const cors = require('cors')
//const router = express.Router();
const {mongoose} = require('./srv/config/connecttomongodb.config')
//const serv = express();

module.exports = async (o) => {
    try{
        let app = express();
        app.express = express;
        app.use(express.json({limit: '500kb'}));
        app.use(cors());

        //
        //app.use('/security', require('./srv/api/routes/sec-users-route.cds'));

        //app.use('/api', Router());
        app.use('/api', express.Router());

        /*
        app.get('/',(req,res) => {
            res.end(`SAP CDS esta en ejecución...${req.url}`);
        });
        */
       
        o.app = app;
        o.app.httpServer = await cds.server(o);

        return o.app.httpServer;

    }catch(error){
        console.error('Error starting server',error);
        process.exit(1);
    }
};







