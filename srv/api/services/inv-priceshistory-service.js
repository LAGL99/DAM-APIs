
const ztpriceshistory = require('../models/mongodb/ztpriceshistory-model')
const axios = require('axios')


async function GetAllPricesHistory(req){

    
    try {

        const idprices = parseInt(req.req.query?.idprices)
        const iniVolume = parseFloat(req.req.query?.iniVolume)
        const endVolume = parseFloat(req.req.query?.endVolume)
        //console.log(idprices)
        let priceshistorylist;
        if (idprices>=0){
            priceshistorylist = await ztpriceshistory.findOne({ID : idprices}).lean();
            //console.log(idprices)
            //http://localhost:3020/api/inv/getall?idprices=2
        }else if (iniVolume >=0 && endVolume >=0){
            priceshistorylist = await ztpriceshistory.find({
                VOLUME : { $gte: iniVolume, $lte: endVolume}
            }).lean();
            //http://localhost:3020/api/inv/getall?iniVolume=0&endVolume=13594501
        }else{
            priceshistorylist = await ztpriceshistory.find().lean();
            //http://localhost:3020/api/inv/getall
        }
        
        return (priceshistorylist);


    } catch (error) {
        return error    
    } finally {}

}

//post one que llamamos add one en price history
async function AddOnePricesHistory(req){

    
    try {

        //const body = req.req.body
        const newPrices = req.req.body.prices
        //console.log(idprices)
        let priceshistorylist;
        
            priceshistorylist = await ztpriceshistory.insertMany(newPrices, {order : true})
            //http://localhost:3020/api/inv/addone
        
        
        
        return(JSON.parse(JSON.stringify(pricesHistory)));



    } catch (error) {
        return error    
    } finally {}

}

async function UpdateOnePricesHistory(req){

    
    try {
        
        //const body = req.req.body
        const idprices = parseInt(req.req.query?.idprices)
        const newPrices = req.req.body.prices
        
        let priceshistorylist;
        
            priceshistorylist = await ztpriceshistory.updateMany({ID: idprices},newPrices)
            //http://localhost:3020/api/inv/updateone
        
        
            return(JSON.parse(JSON.stringify(pricesHistory)));


    } catch (error) {
        return error    
    } finally {}

}

async function DeleteOnePricesHistory(req){

    
    try {

        //const body = req.req.body
        const idprices = parseInt(req.req.query?.idprices)
        
        let priceshistorylist;
        
            priceshistorylist = await ztpriceshistory.deleteOne({ID: idprices})
            //http://localhost:3020/api/inv/deleteone
        
        
        return (priceshistorylist);


    } catch (error) {
        return error    
    } finally {}

}

async function GetCompanies(req) {
  try {
    // URL ejemplo para buscar símbolos, este endpoint puede variar según doc Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=technology&apikey=${API_KEY}`;
    const response = await axios.get(url);
    
    // Procesa response.data para devolver sólo la info necesaria
    // Ejemplo: response.data.bestMatches
    const companies = response.data.bestMatches.map(c => ({
      symbol: c['1. symbol'],
      name: c['2. name'],
      exchange: c['4. region'],
      assetType: c['3. type']
    }));

    return companies;
  } catch (error) {
    return { error: 'Error al obtener empresas: ' + error.message };
  }
}

module.exports = {GetAllPricesHistory,AddOnePricesHistory,UpdateOnePricesHistory,DeleteOnePricesHistory, GetCompanies}