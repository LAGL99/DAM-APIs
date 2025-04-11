//import * as mongoose from 'mongoose';

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
)