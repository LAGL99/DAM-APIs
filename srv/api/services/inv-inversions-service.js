const ztpriceshistory = require("../models/mongodb/ztpriceshistory-model");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

async function GetAllPricesHistory(req) {
  try {
    const idprices = parseInt(req.req.query?.idprices);
    const iniVolume = parseFloat(req.req.query?.iniVolume);
    const endVolume = parseFloat(req.req.query?.endVolume);
    //console.log(idprices)
    let priceshistorylist;
    if (idprices >= 0) {
      priceshistorylist = await ztpriceshistory
        .findOne({ ID: idprices })
        .lean();
      //console.log(idprices)
      //http://localhost:3020/api/inv/getall?idprices=2
    } else if (iniVolume >= 0 && endVolume >= 0) {
      priceshistorylist = await ztpriceshistory
        .find({
          VOLUME: { $gte: iniVolume, $lte: endVolume },
        })
        .lean();
      //http://localhost:3020/api/inv/getall?iniVolume=0&endVolume=13594501
    } else {
      priceshistorylist = await ztpriceshistory.find().lean();
      //http://localhost:3020/api/inv/getall
    }

    return priceshistorylist;
  } catch (error) {
    return error;
  } finally {
  }
}

//post one que llamamos add one en price history
async function AddOnePricesHistory(req) {
  try {
    //const body = req.req.body
    const newPrices = req.req.body.prices;
    //console.log(idprices)
    let priceshistorylist;

    priceshistorylist = await ztpriceshistory.insertMany(newPrices, {
      order: true,
    });
    //http://localhost:3020/api/inv/addone

    return JSON.parse(JSON.stringify(pricesHistory));
  } catch (error) {
    return error;
  } finally {
  }
}

async function UpdateOnePricesHistory(req) {
  try {
    //const body = req.req.body
    const idprices = parseInt(req.req.query?.idprices);
    const newPrices = req.req.body.prices;

    let priceshistorylist;

    priceshistorylist = await ztpriceshistory.updateMany(
      { ID: idprices },
      newPrices
    );
    //http://localhost:3020/api/inv/updateone

    return JSON.parse(JSON.stringify(pricesHistory));
  } catch (error) {
    return error;
  } finally {
  }
}

async function DeleteOnePricesHistory(req) {
  try {
    //const body = req.req.body
    const idprices = parseInt(req.req.query?.idprices);

    let priceshistorylist;

    priceshistorylist = await ztpriceshistory.deleteOne({ ID: idprices });
    //http://localhost:3020/api/inv/deleteone

    return priceshistorylist;
  } catch (error) {
    return error;
  } finally {
  }
}

async function simulateSupertrend(req) {
  console.log(req);

  try {
    const { SYMBOL, STARTDATE, ENDDATE, AMOUNT, USERID, SPECS } = req || {};

    if (!SYMBOL || !STARTDATE || !ENDDATE || !AMOUNT || !USERID) {
      throw new Error(
        "FALTAN PARÁMETROS REQUERIDOS EN EL CUERPO DE LA SOLICITUD: 'SYMBOL', 'STARTDATE', 'ENDDATE', 'AMOUNT', 'USERID'."
      );
    }

    if (new Date(ENDDATE) < new Date(STARTDATE)) {
      throw new Error(
        "La fecha de fin  no puede ser anterior a la fecha de inicio."
      );
    }

    // Verificar si AMOUNT es numérico
    if (isNaN(AMOUNT) || typeof AMOUNT !== 'number' || AMOUNT <= 0) {
      throw new Error("El monto a invertir debe ser una cantidad válida.");
    }

  
    //METODO PARA ASIGNAR UN ID A LA SIMULACION BASADO EN LA FECHA
    const generateSimulationId = (SYMBOL) => {
      const date = new Date();
      const timestamp = date.toISOString().replace(/[^0-9]/g, "");
      const random = Math.floor(Math.random() * 10000);
      return `${SYMBOL}_${timestamp}_${random}`;
    };

    const SIMULATIONID = generateSimulationId(SYMBOL);
    const SIMULATIONNAME = "Estrategia Supertrend + MA";
    const STRATEGYID = "idST";

    //Se buscan los identificadores en SPECS
    const MALENGTH =
      parseInt(
        SPECS?.find((i) => i.INDICATOR?.toLowerCase() === "ma_length")?.VALUE
      ) || 20;
    const ATR_PERIOD =
      parseInt(
        SPECS?.find((i) => i.INDICATOR?.toLowerCase() === "atr")?.VALUE
      ) || 10;
    const MULT =
      parseFloat(
        SPECS?.find((i) => i.INDICATOR?.toLowerCase() === "mult")?.VALUE
      ) || 2.0;
    const RR =
      parseFloat(
        SPECS?.find((i) => i.INDICATOR?.toLowerCase() === "rr")?.VALUE
      ) || 1.5;

    if (isNaN(MALENGTH) || isNaN(ATR_PERIOD) || isNaN(MULT) || isNaN(RR)){
      throw new Error(
        "Los parámetros para la simulación deben ser valores numéricos."
      );
    }
    if (MALENGTH <= 0 || ATR_PERIOD <= 0 || MULT <= 0 || RR <= 0){
      throw new Error(
        "Los parámetros para la simulación deben ser mayores a 0."
      );
    }

    //Se realiza la consulta de los historicos a AlphaVantage
    const apiKey = process.env.ALPHA_VANTAGE_KEY || "demo";
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&outputsize=full&apikey=${apiKey}`;
    const resp = await axios.get(apiUrl);

    const rawTs = resp.data["Time Series (Daily)"];
    if (!rawTs) throw new Error("Respuesta inválida de AlphaVantage");

    //Ordena las fechas de forma cronológica
    const allDatesSorted = Object.keys(rawTs).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    //Ajusta el indice de inicio
    const extendedStartIndex =
      allDatesSorted.findIndex((d) => d >= STARTDATE) -
      Math.max(MALENGTH, ATR_PERIOD);
    const adjustedStartIndex = extendedStartIndex >= 0 ? extendedStartIndex : 0; //Si no hay suficientes datos históricos, se inicia desde el primer dato disponible.

    //Filtra y mapea los precios
    const prices = allDatesSorted
      .slice(adjustedStartIndex) //Toma las fechas desde adjustedStartIndex
      .filter((date) => date <= ENDDATE) //Filtra fechas posteriores a ENDDATE
      .map((date) => ({
        //Convierte cada fecha en un objeto con los datos de precio
        DATE: date,
        OPEN: +rawTs[date]["1. open"],
        HIGH: +rawTs[date]["2. high"],
        LOW: +rawTs[date]["3. low"],
        CLOSE: +rawTs[date]["4. close"],
        VOLUME: +rawTs[date]["5. volume"],
      }));

    //Formula para calcular la Media Móvil Simple (SMA)
    const sma = (arr, len) =>
      arr.map((_, i) =>
        i >= len - 1
          ? arr.slice(i - len + 1, i + 1).reduce((a, b) => a + b, 0) / len
          : null
      );

    //Formula para calcular el Average True Range (ATR)

    const atr = (arr, period) => {
      const result = Array(arr.length).fill(null);
      const trValues = []; // Array para almacenar los TR

      for (let i = 1; i < arr.length; i++) {
        const high = arr[i].HIGH;
        const low = arr[i].LOW;
        const prevClose = arr[i - 1].CLOSE;

        // Calcula el TR y lo guarda en el array
        const tr = Math.max(
          high - low,
          Math.abs(high - prevClose),
          Math.abs(low - prevClose)
        );
        trValues.push(tr);

        // Calcula el ATR cuando hay suficientes datos
        if (i >= period) {
          const startIdx = i - period;
          const atr =
            trValues.slice(startIdx, i).reduce((a, b) => a + b, 0) / period;
          result[i] = atr;
        } else {
          result[i] = null;
        }
      }

      return result;
    };
    const closes = prices.map((p) => p.CLOSE); //Se almacena el array de precios de cierre
    const ma = sma(closes, MALENGTH); //Se almacena el array de MA calculado
    const atrVals = atr(prices, ATR_PERIOD); //Se almacena el array de ATR calculado

    let position = null;
    const signals = [];
    let cash = parseFloat(AMOUNT);
    let shares = 0;
    let realProfit = 0;
    const chartData = [];

    for (let i = MALENGTH; i < prices.length; i++) {
      const bar = prices[i];
      const close = bar.CLOSE;
      const trendUp = close > ma[i];
      const trendDown = close < ma[i];
      const stopDistance = atrVals[i] * MULT;
      const profitDistance = stopDistance * RR;

      let currentSignal = null;
      let reasoning = null;
      let profitLoss = 0;
      let sharesTransacted = 0;

      // Lógica de COMPRA (El precio cierra por encima de la MA, y la tendencia es alcista, y el precio del dia anterior estaba por debajo de la MA)
      if (!position &&  cash > 0 && trendUp && closes[i - 1] < ma[i - 1]) {
        const invest = cash * 1; // Invierto todo el capital disponible, previamente solo se usaba el 50%
        shares = invest / close;
        cash -= invest;
        position = {
          entryPrice: close,
          stop: close - stopDistance,
          limit: close + profitDistance,
        };
        currentSignal = "buy";
        reasoning = "Tendencia alcista identificada.";
        sharesTransacted = shares; // Registrar unidades compradas
      }
      // Lógica de VENTA  (El precio alcanza el nivel objetivo o, el precio cae hasta el nivel del stop-loss o, el precio cierra por debajo de la MA)
      else if (position) {
        if (close >= position.limit || close <= position.stop || trendDown) {
          const soldShares = shares; // Guardar unidades antes de resetear
          cash += soldShares * close;
          profitLoss = (close - position.entryPrice) * soldShares;
          realProfit += profitLoss;
          currentSignal = "sell";
          if (close >= position.limit) {
            reasoning = "Precio objetivo alcanzado.";
          }
          if (close <= position.stop) {
            reasoning = "Stop-loss alcanzado.";
          }
          if (trendDown) {
            reasoning = "Precio por debajo de la MA";
          }
          sharesTransacted = soldShares; // Registrar unidades vendidas
          shares = 0; // Resetear después de registrar
          position = null;
        }
      }

      // Registrar la señal (compra o venta)
      if (currentSignal) {
        signals.push({
          DATE: bar.DATE,
          TYPE: currentSignal,
          PRICE: parseFloat(close.toFixed(2)),
          REASONING: reasoning,
          SHARES: parseFloat(sharesTransacted.toFixed(15)), // Usar sharesTransacted
          PROFIT: parseFloat(profitLoss.toFixed(2)),
        });
      }

      // Datos para el gráfico
      chartData.push({
        ...bar,
        INDICATORS: [
          { INDICATOR: "ma", VALUE: parseFloat((ma[i] ?? 0).toFixed(2)) },
          { INDICATOR: "atr", VALUE: parseFloat((atrVals[i] ?? 0).toFixed(2)) },
        ],
      });
    }

    // Calcular métricas finales
    const finalValue = shares * prices.at(-1).CLOSE;
    const finalBalance = cash + finalValue;
    const percentageReturn = ((finalBalance - AMOUNT) / AMOUNT) * 100;

    const summary = {
      TOTAL_BOUGHT_UNITS: parseFloat(
        signals
          .filter((s) => s.TYPE === "buy")
          .reduce((a, s) => a + s.SHARES, 0)
          .toFixed(5)
      ),
      TOTAL_SOLD_UNITS: parseFloat(
        signals
          .filter((s) => s.TYPE === "sell")
          .reduce((a, s) => a + s.SHARES, 0)
          .toFixed(5)
      ),
      REMAINING_UNITS: parseFloat(shares.toFixed(5)),
      FINAL_CASH: parseFloat(cash.toFixed(2)),
      FINAL_VALUE: parseFloat(finalValue.toFixed(2)),
      FINAL_BALANCE: parseFloat(finalBalance.toFixed(2)),
      REAL_PROFIT: parseFloat(realProfit.toFixed(2)),
      PERCENTAGE_RETURN: parseFloat(percentageReturn.toFixed(2)),
    };

    const detailRow = [
      {
        ACTIVED: true,
        DELETED: false,
        DETAIL_ROW_REG: [
          {
            CURRENT: true,
            REGDATE: new Date().toISOString().slice(0, 10),
            REGTIME: new Date().toLocaleTimeString("es-ES", { hour12: false }),
            REGUSER: USERID,
          },
        ],
      },
    ];

    return {
      SIMULATIONID,
      USERID,
      STRATEGYID,
      SIMULATIONNAME,
      SYMBOL,
      INDICATORS: { value: SPECS },
      AMOUNT: parseFloat(AMOUNT.toFixed(2)),
      SUMMARY: summary,
      STARTDATE,
      ENDDATE,
      SIGNALS: signals,
      CHART_DATA: chartData,
      DETAIL_ROW: detailRow,
    };
  } catch (error) {
    console.error("Error en simulación de Supertrend + MA:", error);
    throw error;
  }
}

module.exports = {
  GetAllPricesHistory,
  AddOnePricesHistory,
  UpdateOnePricesHistory,
  DeleteOnePricesHistory,
  simulateSupertrend,
};
