//1.-importacion de las librerias 
const cds = require ('@sap/cds');


//2.-importar el servicio 
// aun no esta creado el servicio 
const {GetAllPricesHistory,AddOnePricesHistory,UpdateOnePricesHistory,DeleteOnePricesHistory} = require('../services/inv-priceshistory-service')
//cosnt (GetAllPricesHistory) = requires(../services/inv-inversions-sservice)

//3.- estructura princiapl  de la clas de contorller 

class inversionsClass extends cds.ApplicationService{

    //4.-iniciiarlizarlo de manera asincrona 
    async init (){

        this.on('getall', async (req)=> {

            return GetAllPricesHistory(req);
            //requesamso ala aruta 
        });


        this.on('addone', async (req)=> {

            return AddOnePricesHistory(req);
            //requesamso ala aruta 
        });

        this.on('updateone', async (req)=> {

            return UpdateOnePricesHistory(req);
            //requesamso ala aruta 
        });

        
        this.on('deleteone', async (req)=> {

            return DeleteOnePricesHistory(req);
            //requesamso ala aruta 
        });
        return await super.init();
    };

};


module.exports = inversionsClass;

