
const ztpriceshistory = require('../models/mongodb/ztpriceshistory-model')
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

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





async function simulateTurtleSoup(symbol, startDate, endDate, amount, userId, specs) {
  // 1. Parseo de specs
  const specMap = specs
    .split('&')
    .map(pair => pair.split(':'))
    .reduce((acc, [rawKey, rawVal]) => {
      const key = rawKey.trim().toLowerCase();
      const val = rawVal.trim();
      // Detectar ON/OFF → booleano; en otro caso, number
      if (/^on$/i.test(val))          acc[key] = true;
      else if (/^off$/i.test(val))    acc[key] = false;
      else                            acc[key] = parseFloat(val);
      return acc;
    }, {});

  const lookback = specMap['lookback'] ?? 20;
  const rr       = specMap['rr']       ?? 1.5;
  const useFvg   = specMap['fvg']      ?? false;
  const useOb    = specMap['ob']       ?? false;

  // 2. Fetch de datos con AlphaVantage
  const apiKey = process.env.ALPHA_VANTAGE_KEY || 'demo';
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
  const resp   = await axios.get(apiUrl);
  const rawTs  = resp.data['Time Series (Daily)'];
  if (!rawTs) throw new Error('Respuesta inválida de AlphaVantage');

  // 3. Mapear y filtrar por rango de fechas
  const prices = Object.entries(rawTs)
    .map(([date, ohlc]) => ({
      date,
      open:  +ohlc['1. open'],
      high:  +ohlc['2. high'],
      low:   +ohlc['3. low'],
      close: +ohlc['4. close']
    }))
    .filter(p => p.date >= startDate && p.date <= endDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (prices.length < lookback + 1) {
    throw new Error(`Se necesitan al menos ${lookback + 1} velas para lookback=${lookback}`);
  }

  // 4. Funciones auxiliares Donchian
  const donchianHigh = i => Math.max(...prices.slice(i - lookback, i).map(p => p.high));
  const donchianLow  = i => Math.min(...prices.slice(i - lookback, i).map(p => p.low));

  // 5. Estado de la simulación
  let position = null;
  const signals  = [];
  const trades   = [];
  let cash       = amount;
  let shares     = 0;

  // 6. Loop de velas
  for (let i = lookback; i < prices.length; i++) {
    const bar  = prices[i];
    const prev = prices[i - 1];
    const H    = donchianHigh(i);
    const L    = donchianLow(i);

    // 6.1. Turtle Soup Setups
    const tbsLong  = bar.close < L && bar.close > bar.open && prev.open < prev.close;
    const twsLong  = bar.low   < L && bar.close > L;
    const tbsShort = bar.close > H && bar.close < bar.open && prev.open > prev.close;
    const twsShort = bar.high  > H && bar.close < H;

    // 6.2. Lógica de Order Blocks
    const bullOB = bar.close > bar.open && bar.close > prev.high && prev.open > prev.close;
    const bearOB = bar.close < bar.open && bar.close < prev.low  && prev.open < prev.close;

    // 6.3. Lógica de Fair Value Gap (mira dos velas atrás)
    const twoBack = prices[i - 2];
    const fvgUp   = twoBack && (bar.low  >  twoBack.high);
    const fvgDn   = twoBack && (bar.high <  twoBack.low);

    // 6.4. Confluencias
    const longConfluence  = (!useOb || bullOB) && (!useFvg || fvgUp);
    const shortConfluence = (!useOb || bearOB) && (!useFvg || fvgDn);

    // 6.5. Señales finales con filtros
    const longEntry  = (tbsLong || twsLong) && longConfluence;
    const shortEntry = (tbsShort || twsShort) && shortConfluence;

    // 6.6. Niveles SL/TP
    const longSL   = bar.low;
    const longTP   = bar.close + (bar.close - L) * rr;
    const shortSL  = bar.high;
    const shortTP  = bar.close - (H - bar.close) * rr;

    // 6.7. Apertura de posición
    if (!position) {
      if (longEntry) {
        shares   = cash / bar.close;
        cash     = 0;
        position = { type:'long', entryPrice:bar.close, SL:longSL, TP:longTP, entryDate:bar.date };
        signals.push({ date:bar.date, type:'buy',  price:bar.close, reasoning:`Entry Long @${bar.close}` });
      } else if (shortEntry) {
        shares   = cash / bar.close;
        cash     = 0;
        position = { type:'short', entryPrice:bar.close, SL:shortSL, TP:shortTP, entryDate:bar.date };
        signals.push({ date:bar.date, type:'sell', price:bar.close, reasoning:`Entry Short @${bar.close}` });
      }
    }
    // 6.8. Gestión de SL / TP
    else {
      if (position.type === 'long') {
        // Stop Loss
        if (bar.low <= position.SL) {
          const exitPrice = position.SL;
          cash = shares * exitPrice;
          trades.push({
            entryDate:  position.entryDate,
            exitDate:   bar.date,
            type:       'long',
            entryPrice: position.entryPrice,
            exitPrice,
            result:     cash - amount
          });
          signals.push({ date:bar.date, type:'sell', price:exitPrice, reasoning:'Stop Loss Long' });
          position = null; shares = 0;
        }
        // Take Profit
        else if (bar.high >= position.TP) {
          const exitPrice = position.TP;
          cash = shares * exitPrice;
          trades.push({
            entryDate:  position.entryDate,
            exitDate:   bar.date,
            type:       'long',
            entryPrice: position.entryPrice,
            exitPrice,
            result:     cash - amount
          });
          signals.push({ date:bar.date, type:'sell', price:exitPrice, reasoning:'Take Profit Long' });
          position = null; shares = 0;
        }
      } else {
        // Stop Loss Short
        if (bar.high >= position.SL) {
          const exitPrice = position.SL;
          cash = shares * (2 * position.entryPrice - exitPrice);
          trades.push({
            entryDate:  position.entryDate,
            exitDate:   bar.date,
            type:       'short',
            entryPrice: position.entryPrice,
            exitPrice,
            result:     cash - amount
          });
          signals.push({ date:bar.date, type:'buy',  price:exitPrice, reasoning:'Stop Loss Short' });
          position = null; shares = 0;
        }
        // Take Profit Short
        else if (bar.low <= position.TP) {
          const exitPrice = position.TP;
          cash = shares * (2 * position.entryPrice - exitPrice);
          trades.push({
            entryDate:  position.entryDate,
            exitDate:   bar.date,
            type:       'short',
            entryPrice: position.entryPrice,
            exitPrice,
            result:     cash - amount
          });
          signals.push({ date:bar.date, type:'buy',  price:exitPrice, reasoning:'Take Profit Short' });
          position = null; shares = 0;
        }
      }
    }
  }

  // 7. Cierre de posición abierta al final
  if (position) {
    const last = prices[prices.length - 1];
    const exitPrice = position.type === 'long'
      ? last.close
      : (2 * position.entryPrice - last.close);
    cash = position.type === 'long'
      ? shares * last.close
      : shares * exitPrice;
    trades.push({
      entryDate:  position.entryDate,
      exitDate:   last.date,
      type:       position.type,
      entryPrice: position.entryPrice,
      exitPrice,
      result:     cash - amount
    });
    position = null; shares = 0;
  }

  // 8. Resultados finales
  const totalReturn      = parseFloat(cash.toFixed(2));
  const percentageReturn = parseFloat(((cash / amount) - 1).toFixed(4));

  // 9. Guardar simulación en MongoDB
  const simObj = {
    idSimulation:   `TBS_${Date.now()}_${uuidv4()}`,
    idUser:         userId,
    idStrategy:     'TBS',
    simulationName: 'Turtle Soup',
    symbol, startDate, endDate, amount, specs,
    result:         totalReturn,
    percentageReturn,
    signals,
    trades,
    DETAIL_ROW: [{
      ACTIVED:       true,
      DELETED:       false,
      DETAIL_ROW_REG:[{
        CURRENT:   true,
        REGDATE:   new Date(),
        REGTIME:   new Date(),
        REGUSER:   userId
      }]
    }]
  };

  await mongoose.connection.collection('SIMULATION').insertOne(simObj);

  return {
    message:    'Simulación TurtleSoup creada.',
    simulation: simObj
  };
}


module.exports = {GetAllPricesHistory,AddOnePricesHistory,UpdateOnePricesHistory,DeleteOnePricesHistory,simulateTurtleSoup}