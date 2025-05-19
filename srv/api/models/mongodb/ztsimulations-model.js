/* //import * as mongoose from 'mongoose';

const mongoose = require('mongoose')


const ZTPricesHistorySchema = new mongoose.Schema({
    ID:     { type : Number, required : true },
    DATE:   { type : Date },
    OPEN:   { type : Number},
    HIGH:   { type : Number},
    LOW:    { type : Number},
    CLOSE:  { type : Number},
    VOLUME: { type : Number}
    
 });

module.exports =  mongoose.model(
    'ZTPRICESHISTORY',
    ZTPricesHistorySchema,
    'ZTPRICESHISTORY'
) */

/*     entity simulacion {
    key ID: Integer;
    NAME: String;
    MONT: Decimal;
    DATE: DateTime;
    ACTIVE: Boolean;
} */

const mongoose = require('mongoose')

const ZTSimulationsSchema = new mongoose.Schema({
    ID: { type : Number, required : true},
    NAME: { type: String},
    MONT: { type: Number },
    DATE: { type: Date},
    ACTIVE: { type: Boolean }
})