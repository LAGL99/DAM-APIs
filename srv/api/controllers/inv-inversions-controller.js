//1.-importacion de las librerias
const cds = require("@sap/cds");
const axios = require("axios");

//2.-importar el servicio
// aun no esta creado el servicio
const {
  GetAllPricesHistory,
  AddOnePricesHistory,
  UpdateOnePricesHistory,
  DeleteOnePricesHistory,
} = require("../services/inv-priceshistory-service");
const { GetAllCompanies } = require("../services/inv-inversions-service");
//cosnt (GetAllPricesHistory) = requires(../services/inv-inversions-sservice)

//3.- estructura princiapl  de la clas de contorller

class inversionsClass extends cds.ApplicationService {
  //4.-iniciiarlizarlo de manera asincrona
  async init() {
    this.on("getall", async (req) => {
      return GetAllPricesHistory(req);
      //requesamso ala aruta
    });

    this.on("addone", async (req) => {
      return AddOnePricesHistory(req);
      //requesamso ala aruta
    });

    this.on("updateone", async (req) => {
      return UpdateOnePricesHistory(req);
      //requesamso ala aruta
    });

    this.on("deleteone", async (req) => {
      return DeleteOnePricesHistory(req);
      //requesamso ala aruta
    });

    this.on("GetAllCompanies", async (req) => {
      try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: "LISTING_STATUS",
            apikey: process.env.ALPHA_VANTAGE_API_KEY,
          },
        });

        // La API de Alpha Vantage para LISTING_STATUS devuelve CSV, no JSON
        // Entonces tienes que parsear la respuesta

        const csvData = response.data; // texto CSV

        // Usamos un parser para CSV o procesamos manualmente:
        const lines = csvData.split("\n");
        const header = lines[0].split(",");
        const companies = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          const cols = line.split(",");

          companies.push({
            symbol: cols[0],
            name: cols[1],
            exchange: cols[2],
            assetType: cols[3],
          });
        }

        return companies;
      } catch (err) {
        req.error(500, "Error al obtener empresas: " + err.message);
      }
    });

    this.on("READ", "Priceshistory", async (req) => {
      const { symbol, interval } = req.data;

      // Ejemplo: busca el historial con sus datos asociados
      const result = await cds.transaction(req).run(`
    SELECT FROM inv.Priceshistory
    WHERE symbol = ${symbol} AND interval = ${interval}
    INCLUDE data
  `);

      return result;
    });

    this.on("generateIndicators", async (req) => {
      console.log("generateIndicators req.data:", req.data);
  const params = req.data || req.query || {};
  let { symbol, interval, timeframe, indicators } = params;

  if (!symbol || !interval || !timeframe) {
    return req.error(400, "Parámetros inválidos: faltan symbol, interval o timeframe.");
  }

  if (typeof indicators === 'string') {
    indicators = indicators.split(",").map(i => i.trim());
  }

  if (!Array.isArray(indicators) || indicators.length === 0) {
    return req.error(400, "Indicadores inválidos o no especificados.");
  
      }

      try {
        // Paso 1: Obtener datos históricos de precios (por ejemplo, TIME_SERIES_DAILY)
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        const url = `https://www.alphavantage.co/query`;
        const params = {
          function: "TIME_SERIES_DAILY_ADJUSTED",
          symbol: symbol,
          outputsize: "compact",
          apikey: apiKey,
        };

        const response = await axios.get(url, { params });

        const timeSeries = response.data["Time Series (Daily)"];
        if (!timeSeries) {
          return req.error(
            404,
            "No se encontraron datos para el símbolo solicitado."
          );
        }

        // Convertir el objeto a array ordenado de fechas descendente
        const dates = Object.keys(timeSeries).sort(
          (a, b) => new Date(a) - new Date(b)
        );

        // Extraer precios de cierre, volumen, etc.
        const closePrices = dates.map((date) =>
          parseFloat(timeSeries[date]["4. close"])
        );
        const highPrices = dates.map((date) =>
          parseFloat(timeSeries[date]["2. high"])
        );
        const lowPrices = dates.map((date) =>
          parseFloat(timeSeries[date]["3. low"])
        );
        const volume = dates.map((date) =>
          parseFloat(timeSeries[date]["6. volume"])
        );

        // Paso 2: Calcular indicadores técnicos usando la librería

        // RSI (ejemplo con periodo 14)
        let rsiValues = [];
        if (indicators.includes("RSI")) {
          rsiValues = RSI.calculate({ values: closePrices, period: 14 });
          // rsiValues es más corto que closePrices (n-14)
        }

        // MACD (valores por defecto)
        let macdValues = [];
        if (indicators.includes("MACD")) {
          macdValues = MACD.calculate({
            values: closePrices,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
          });
          // MACD devuelve objetos con MACD, signal, histogram
        }

        // SHORT y LONG pueden ser medias móviles simples (SMA) para ejemplo
        let shortSMA = [];
        let longSMA = [];
        if (indicators.includes("SHORT")) {
          shortSMA = SMA.calculate({ period: 10, values: closePrices });
        }
        if (indicators.includes("LONG")) {
          longSMA = SMA.calculate({ period: 30, values: closePrices });
        }

        // Paso 3: Construir array de IndicatorData (ajustando por índices de indicadores)
        const result = [];

        // Como indicadores tienen diferentes longitudes, tomamos el rango más pequeño para evitar undefined
        const minLength = Math.min(
          dates.length,
          rsiValues.length ? rsiValues.length + 14 : dates.length,
          macdValues.length ? macdValues.length + 26 : dates.length,
          shortSMA.length ? shortSMA.length + 10 : dates.length,
          longSMA.length ? longSMA.length + 30 : dates.length
        );

        for (let i = 0; i < minLength; i++) {
          const idx = dates.length - minLength + i; // índice real en las fechas

          const indicatorData = {
            date: new Date(dates[idx]).toISOString(),
          };

          if (indicators.includes("RSI")) {
            indicatorData.RSI =
              rsiValues[i - (dates.length - rsiValues.length)] || null;
          }
          if (indicators.includes("MACD")) {
            const macdIndex = i - (dates.length - macdValues.length);
            indicatorData.MACD = macdValues[macdIndex]
              ? macdValues[macdIndex].MACD
              : null;
          }
          if (indicators.includes("SHORT")) {
            indicatorData.SHORT =
              shortSMA[i - (dates.length - shortSMA.length)] || null;
          }
          if (indicators.includes("LONG")) {
            indicatorData.LONG =
              longSMA[i - (dates.length - longSMA.length)] || null;
          }

          result.push(indicatorData);
        }

        return result;
      } catch (err) {
        console.error("Error al generar indicadores:", err);
        return req.error(500, "Error interno al generar indicadores.");
      }
    });

    return await super.init();
  }
}

module.exports = inversionsClass;
