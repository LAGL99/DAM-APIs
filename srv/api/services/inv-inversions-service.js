const axios = require('axios');
const ZTPRICESHISTORYModel = require('../models/mongodb/ztpriceshistory-model');

async function GetAllCompanies() {
  try {
    const API_KEY = process.env.ALPHAVANTAGE_KEY;
    const url = `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${API_KEY}`;
    const response = await axios.get(url);

    if (!response.data || typeof response.data !== 'string') {
      throw new Error('Respuesta inválida del API externo');
    }

    const lines = response.data.trim().split('\n');
    const headers = lines[0].split(',');

    const companies = lines.slice(1)
      .map(line => line.split(','))
      .filter(fields => fields[3] === 'Stock') // assetType === 'Stock'
      .map(fields => ({
        SYMBOL: fields[0],
        NAME: fields[1],
        EXCHANGE: fields[2],
        ASSETTYPE: fields[3],
        IPODATE: fields[4],
        DELISTINGDATE: fields[5],
        STATUS: fields[6],
      }));

    return companies;

  } catch (err) {
    console.error('Error al obtener empresas:', err.message);
    throw new Error('No se pudieron obtener las empresas');
  }
}

module.exports = {
  GetAllCompanies,
  // (otras funciones que ya tenías aquí)
};

/* module.exports = cds.service.impl(async function() {
  const { PriceshistoryDoc } = this.entities;

  this.on('READ', 'PriceshistoryDoc', async (req) => {
    const data = await cds.tx(req).run(SELECT.from(PriceshistoryDoc));
    console.log('PriceshistoryDoc data:', data);
    return data;
  });
}); */

module.exports = cds.service.impl(async function() {
  const { PriceshistoryDocs, PriceData, strategies, Indicators, IndicatorData } = this.entities;

  // Implementación de función GetAllCompanies
  this.on('GetAllCompanies', async (req) => {
    // Aquí conecta con tu base de datos o servicio externo para traer la lista de empresas
    // Ejemplo básico con datos estáticos:
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', assetType: 'stock', ipoDate: '1980-12-12', delistingDate: null, status: 'active' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', assetType: 'stock', ipoDate: '1986-03-13', delistingDate: null, status: 'active' }
    ];
  });

  // Puedes agregar handlers para entidades si quieres controlar la lógica
  // Ejemplo: custom read for PriceshistoryDocs
  this.on('READ', 'priceshistory', async (req) => {
  try {
    // Si quieres filtrar por symbol u otro campo, usa req.data
    const filter = {};
    if (req.data.symbol) {
      filter.SYMBOL = req.data.symbol;
    }
    const data = await PriceHistoryModel.find(filter).lean();
    return data;
  } catch (error) {
    console.error('Error MongoDB:', error);
    req.reject(500, 'Error leyendo pricehistory');
  }
});

  // Similar para IndicatorsDocs, PriceDatas, etc.
});