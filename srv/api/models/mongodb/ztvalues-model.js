const { Schema, model } = require('mongoose');

const ZtValueSchema = new Schema({
  COMPANYID:   { type: Number, required: true },
  CEDIID:      { type: Number, required: true },
  LABELID:     { type: String, required: true, index: true },
  VALUEPAID:   { type: String },
  VALUEID:     { type: String, required: true, unique: true },
  VALUE:       { type: String },
  ALIAS:       { type: String },
  SEQUENCE:    { type: Number },
  IMAGE:       { type: String },
  VALUESAPID:  { type: String },
  DESCRIPTION: { type: String },
  ROUTE:       { type: String },        // usado para Views
  DETAIL_ROW:  {
    ACTIVED:  { type: Boolean, default: true },
    DELETED:  { type: Boolean, default: false },
    DETAIL_ROW_REG: [
      {
        CURRENT: { type: Boolean },
        REGDATE: { type: Date },
        REGTIME: { type: Date },
        REGUSER: { type: String }
      }
    ]
  }
}, {
  collection: 'ZTVALUES',
  timestamps: false
});

module.exports = model('ZTVALUES', ZtValueSchema, 'ZTVALUES');
