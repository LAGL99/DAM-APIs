namespace inv;
using { cuid } from '@sap/cds/common';

entity priceshistory {
    key ID      : Integer;
    DATE        : DateTime;
    OPEN        : Decimal;
    HIGH        : Decimal;
    LOW         : Decimal;
    CLOSE       : Decimal;
    VOLUME      : Decimal;
};

entity PriceshistoryDoc {
  key ID: String;  // Mejor usar cuid() para el ID, si es string
  symbol: String;
  name: String;
  assetType: String;  // stock | bond | etf | crypto
  interval: String;   // 1d, 1h, 5m
  timezone: String;

  // Relación 1 a muchos con los datos diarios de precios
  data: Composition of many PriceData on data.priceshistory_ID = $self.ID;
}

entity PriceData {
  key ID: Integer;
  priceshistory_ID: String;  // Coincide con el tipo ID de PriceshistoryDoc (String)
  date: DateTime;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  close: Decimal;
  volume: Decimal;
}

entity strategies {
  key ID: Integer;
  name: String;
  description: String;
  time: Time;
  rise: Double;
}

entity Indicators {
  key ID: Integer;
  symbol: String;
  name: String;
  assetType: String;  // stock | bond | etf | crypto
  interval: String;   // 1d, 1h, 5m
  timezone: String;

  data: Composition of many IndicatorData on data.indicators_ID = $self.ID;
}

entity IndicatorData {
  key ID: Integer;
  indicators_ID: Integer;
  date: DateTime;

  SHORT: Decimal;
  LONG: Decimal;
  RSI: Decimal;
  MACD: Decimal;
  // Puedes agregar más indicadores dinámicamente en la lógica backend si es necesario
}

service InversionService {
  function GetAllCompanies() returns array of {
    symbol: String;
    name: String;
    exchange: String;
    assetType: String;
    ipoDate: String;
    delistingDate: String;
    status: String;
  };

  // Proyectar las entidades para exponerlas como servicios OData
  entity PriceshistoryDocs as projection on inv.PriceshistoryDoc;
  entity PriceDatas as projection on inv.PriceData;
  entity Strategies as projection on inv.strategies;
  entity IndicatorsDocs as projection on inv.Indicators;
  entity IndicatorDatas as projection on inv.IndicatorData;
}
