
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






async function simulateSupertrend(symbol, startDate, endDate, amount, userId, specs) {
  const specMap = specs
    .split('&')
    .map(pair => pair.split(':'))
    .reduce((acc, [rawKey, rawVal]) => {
      const key = rawKey.trim().toLowerCase();
      const val = rawVal.trim();
      if (/^on$/i.test(val)) acc[key] = true;
      else if (/^off$/i.test(val)) acc[key] = false;
      else acc[key] = parseFloat(val);
      return acc;
    }, {});

  const maLength = specMap['length'] ?? 20;
  const atrPeriod = specMap['atr'] ?? 10;
  const mult = specMap['mult'] ?? 2.8;
  const rr = specMap['rr'] ?? 3.0;

  const apiKey = process.env.ALPHA_VANTAGE_KEY || 'demo';
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
  const resp = await axios.get(apiUrl);
  const rawTs = resp.data['Time Series (Daily)'];
  if (!rawTs) throw new Error('Respuesta inv\u00e1lida de AlphaVantage');

  const prices = Object.entries(rawTs)
    .map(([date, ohlc]) => ({
      date,
      open: +ohlc['1. open'],
      high: +ohlc['2. high'],
      low: +ohlc['3. low'],
      close: +ohlc['4. close'],
      volume: +ohlc['5. volume']
    }))
    .filter(p => p.date >= startDate && p.date <= endDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const sma = (arr, len) => arr.map((_, i) => i >= len - 1 ? arr.slice(i - len + 1, i + 1).reduce((a, b) => a + b, 0) / len : null);
  const atr = (arr, period) => {
    const result = Array(arr.length).fill(null);
    for (let i = 1; i < arr.length; i++) {
      const high = arr[i].high;
      const low = arr[i].low;
      const prevClose = arr[i - 1].close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      if (i >= period) {
        const trs = arr.slice(i - period + 1, i + 1).map((bar, j) => {
          const h = arr[i - period + 1 + j].high;
          const l = arr[i - period + 1 + j].low;
          const pc = arr[i - period + j].close;
          return Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        });
        result[i] = trs.reduce((a, b) => a + b, 0) / period;
      }
    }
    return result;
  };

  const closes = prices.map(p => p.close);
  const ma = sma(closes, maLength);
  const atrVals = atr(prices, atrPeriod);

  let position = null;
  const signals = [];
  const trades = [];
  let cash = amount;
  let shares = 0;
  const equityCurve = [];
  const chartData = [];

  for (let i = 0; i < prices.length; i++) {
    const bar = prices[i];
    const close = bar.close;
    const short_ma = ma[i];

    chartData.push({
      date: bar.date,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
      short_ma
    });
  }

  for (let i = maLength; i < prices.length; i++) {
    const bar = prices[i];
    const close = bar.close;
    const trendUp = close > ma[i];
    const trendDown = close < ma[i];
    const stopDistance = atrVals[i] * mult;
    const profitDistance = stopDistance * rr;

    equityCurve.push(cash + shares * close);
    const actionType = "";
    if (!position && trendUp && closes[i - 1] < ma[i - 1]) {
      const invest = cash * 0.5;
      shares = invest / close;
      cash -= invest;
      position = { entryPrice: close, entryDate: bar.date, stop: close - stopDistance, limit: close + profitDistance };
      signals.push({ date: bar.date, type: 'buy', price: close, reasoning: 'Supertrend + MA Entry' });
    } else if (position) {
      if (close >= position.limit || close <= position.stop || trendDown) {
        cash += shares * close;
        trades.push({
          entryDate: position.entryDate,
          exitDate: bar.date,
          type: 'long',
          entryPrice: position.entryPrice,
          exitPrice: close,
          shares,
          result: (close - position.entryPrice) * shares,
          action: 'sell',
          duration: (new Date(bar.date) - new Date(position.entryDate)) / (1000 * 60 * 60 * 24)
        });
        signals.push({ date: bar.date, type: 'sell', price: close, reasoning: 'TP/SL or Trend Reversal' });
        shares = 0;
        position = null;
      }
    }
  }

  const totalReturn = parseFloat((cash + shares * prices.at(-1).close).toFixed(2));
  const percentageReturn = parseFloat(((totalReturn / amount) - 1).toFixed(4));
  const totalTrades = trades.length;
  const winTrades = trades.filter(t => t.result > 0);
  const lossTrades = trades.filter(t => t.result < 0);
  const winCount = winTrades.length;
  const lossCount = lossTrades.length;
  const avgWin = winCount ? winTrades.reduce((a, t) => a + t.result, 0) / winCount : 0;
  const avgLoss = lossCount ? lossTrades.reduce((a, t) => a + t.result, 0) / lossCount : 0;
  const avgDuration = totalTrades ? trades.reduce((a, t) => a + t.duration, 0) / totalTrades : 0;
  const maxDrawdown = Math.max(...equityCurve.map((v, i) => Math.max(0, Math.max(...equityCurve.slice(i)) - v)));
  const profitFactor = avgLoss !== 0 ? Math.abs((avgWin * winCount) / (avgLoss * lossCount)) : null;
  const winRate = totalTrades ? winCount / totalTrades : 0;
  const expectancy = (winRate * avgWin) + ((1 - winRate) * avgLoss);

  const simObj = {
    idSimulation: `SUPERTREND_MA_${Date.now()}_${uuidv4()}`,
    idUser: userId,
    idStrategy: 'SUPERTREND_MA_STRATEGY',
    simulationName: 'Supertrend + MA Strategy',
    symbol, startDate, endDate, amount, specs,
    result: totalReturn,
    percentageReturn,
    metrics: {
      totalTrades,
      winCount,
      lossCount,
      avgWin: +avgWin.toFixed(2),
      avgLoss: +avgLoss.toFixed(2),
      profitFactor: profitFactor ? +profitFactor.toFixed(2) : null,
      winRate: +winRate.toFixed(4),
      expectancy: +expectancy.toFixed(2),
      avgDuration: +avgDuration.toFixed(2),
      maxDrawdown: +maxDrawdown.toFixed(2)
    },
    signals,
    trades,
    chart_data: chartData,
    DETAIL_ROW: [{
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [{
        CURRENT: true,
        REGDATE: new Date(),
        REGTIME: new Date(),
        REGUSER: userId
      }]
    }]
  };

  await mongoose.connection.collection('SIMULATION').insertOne(simObj);

  return {
    message: 'Simulacion Supertrend MA creada.',
    value: simObj
  };
}




module.exports = {GetAllPricesHistory,AddOnePricesHistory,UpdateOnePricesHistory,DeleteOnePricesHistory,simulateSupertrend}