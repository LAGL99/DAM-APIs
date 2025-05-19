
const ztpriceshistory = require('../models/mongodb/ztpriceshistory-model')



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

async function simulateTurtleSoup(params) {
  const { symbol, startDate, endDate, amount, userId, specs } = params;

  // 1. Obtener precios históricos (asumiendo colección Mongo con campo SYMBOL)
  const prices = await ztpriceshistory.find({
    SYMBOL: symbol,
    DATE: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).sort({ DATE: 1 }).lean();

  if (!prices.length) throw new Error('No historical prices found');

  // 2. Parámetros Turtle Soup
  const lookback = 20;
  const rr1 = 1.5;
  const useOB = true;
  const useFVG = false;

  // Variables para simulación
  let position = null; // null or { type: 'long'|'short', entryPrice, SL, TP, entryDate }
  let signals = [];
  let trades = [];
  let cash = amount;
  let shares = 0;

  // Funciones auxiliares
  function highestHigh(i) {
    if (i < lookback) return null;
    let max = -Infinity;
    for (let j = i - lookback; j < i; j++) {
      if (prices[j].HIGH > max) max = prices[j].HIGH;
    }
    return max;
  }
  function lowestLow(i) {
    if (i < lookback) return null;
    let min = Infinity;
    for (let j = i - lookback; j < i; j++) {
      if (prices[j].LOW < min) min = prices[j].LOW;
    }
    return min;
  }

  // Loop por cada barra
  for (let i = 0; i < prices.length; i++) {
    const bar = prices[i];

    if (i < lookback) continue; // esperar lookback

    const hh = highestHigh(i);
    const ll = lowestLow(i);

    // Order Block
    const bullOB = bar.CLOSE > bar.OPEN && bar.CLOSE > prices[i - 1].HIGH && prices[i - 1].OPEN > prices[i - 1].CLOSE;
    const bearOB = bar.CLOSE < bar.OPEN && bar.CLOSE < prices[i - 1].LOW && prices[i - 1].OPEN < prices[i - 1].CLOSE;

    // FVG
    const fvgUp = bar.LOW > prices[i - 2].HIGH;
    const fvgDn = bar.HIGH < prices[i - 2].LOW;

    // Turtle Soup setups
    const tbsLong = bar.CLOSE < ll && bar.CLOSE > bar.OPEN && bar.OPEN < ll;
    const tbsShort = bar.CLOSE > hh && bar.CLOSE < bar.OPEN && bar.OPEN > hh;
    const twsLong = bar.LOW < ll && bar.CLOSE > ll;
    const twsShort = bar.HIGH > hh && bar.CLOSE < hh;

    // Confluence
    const longConfluence = (!useOB || bullOB) && (!useFVG || fvgUp);
    const shortConfluence = (!useOB || bearOB) && (!useFVG || fvgDn);

    // Final entries
    const longEntry = (tbsLong || twsLong) && longConfluence;
    const shortEntry = (tbsShort || twsShort) && shortConfluence;

    // SL/TP
    const longSL = bar.LOW;
    const shortSL = bar.HIGH;
    const longTP = bar.CLOSE + (bar.CLOSE - bar.LOW) * rr1;
    const shortTP = bar.CLOSE - (bar.HIGH - bar.CLOSE) * rr1;

    // Manejo de posición y señales
    if (!position) {
      if (longEntry) {
        // Comprar
        shares = cash / bar.CLOSE;
        cash = 0;
        position = { type: 'long', entryPrice: bar.CLOSE, SL: longSL, TP: longTP, entryDate: bar.DATE };
        signals.push({ date: bar.DATE, type: 'buy', price: bar.CLOSE, reasoning: 'Turtle Soup Long Entry' });
      }
      else if (shortEntry) {
        // Vender en corto (simplificado, sin margen real)
        shares = cash / bar.CLOSE;
        cash = 0;
        position = { type: 'short', entryPrice: bar.CLOSE, SL: shortSL, TP: shortTP, entryDate: bar.DATE };
        signals.push({ date: bar.DATE, type: 'sell', price: bar.CLOSE, reasoning: 'Turtle Soup Short Entry' });
      }
    } else {
      // Verificar SL o TP
      if (position.type === 'long') {
        if (bar.LOW <= position.SL) {
          // Stop Loss Long
          cash = shares * position.SL;
          trades.push({ entryDate: position.entryDate, exitDate: bar.DATE, type: 'long', entryPrice: position.entryPrice, exitPrice: position.SL, result: cash - amount });
          shares = 0;
          position = null;
          signals.push({ date: bar.DATE, type: 'sell', price: position.SL, reasoning: 'Stop Loss Long' });
        } else if (bar.HIGH >= position.TP) {
          // Take Profit Long
          cash = shares * position.TP;
          trades.push({ entryDate: position.entryDate, exitDate: bar.DATE, type: 'long', entryPrice: position.entryPrice, exitPrice: position.TP, result: cash - amount });
          shares = 0;
          position = null;
          signals.push({ date: bar.DATE, type: 'sell', price: position.TP, reasoning: 'Take Profit Long' });
        }
      } else if (position.type === 'short') {
        if (bar.HIGH >= position.SL) {
          // Stop Loss Short
          cash = shares * (2 * position.entryPrice - position.SL); // Simplificación
          trades.push({ entryDate: position.entryDate, exitDate: bar.DATE, type: 'short', entryPrice: position.entryPrice, exitPrice: position.SL, result: cash - amount });
          shares = 0;
          position = null;
          signals.push({ date: bar.DATE, type: 'buy', price: position.SL, reasoning: 'Stop Loss Short' });
        } else if (bar.LOW <= position.TP) {
          // Take Profit Short
          cash = shares * (2 * position.entryPrice - position.TP); // Simplificación
          trades.push({ entryDate: position.entryDate, exitDate: bar.DATE, type: 'short', entryPrice: position.entryPrice, exitPrice: position.TP, result: cash - amount });
          shares = 0;
          position = null;
          signals.push({ date: bar.DATE, type: 'buy', price: position.TP, reasoning: 'Take Profit Short' });
        }
      }
    }
  }

  // Si quedó posición abierta al final
  if (position) {
    if (position.type === 'long') {
      cash = shares * prices[prices.length - 1].CLOSE;
      trades.push({ entryDate: position.entryDate, exitDate: prices[prices.length - 1].DATE, type: 'long', entryPrice: position.entryPrice, exitPrice: prices[prices.length - 1].CLOSE, result: cash - amount });
    } else if (position.type === 'short') {
      cash = shares * (2 * position.entryPrice - prices[prices.length - 1].CLOSE);
      trades.push({ entryDate: position.entryDate, exitDate: prices[prices.length - 1].DATE, type: 'short', entryPrice: position.entryPrice, exitPrice: prices[prices.length - 1].CLOSE, result: cash - amount });
    }
  }

  const totalReturn = cash;
  const percentageReturn = (cash / amount) - 1;

  // Crear id simulación
  const idSimulation = `${symbol}_${new Date().toISOString().replace(/[:.]/g, '')}_${uuidv4()}`;

  // Crear detalle para registro
  const DETAIL_ROW = [{
    ACTIVED: true,
    DELETED: false,
    DETAIL_ROW_REG: [{
      CURRENT: true,
      REGDATE: new Date(),
      REGTIME: new Date(),
      REGUSER: userId
    }]
  }];

  // Guardar en base de datos: aquí simulo con un objeto (debes crear modelo para simulaciones)
  // await SimulationModel.create({ ... })

  return {
    idSimulation,
    idUser: userId,
    idStrategy: 'TS', // Turtle Soup
    simulationName: 'Turtle Soup Strategy',
    symbol,
    startDate,
    endDate,
    amount,
    signals,
    specs,
    result: totalReturn.toFixed(2),
    percentageReturn: percentageReturn.toFixed(4),
    DETAIL_ROW,
    trades
  };
}

module.exports = {GetAllPricesHistory,AddOnePricesHistory,UpdateOnePricesHistory,DeleteOnePricesHistory,simulateTurtleSoup}