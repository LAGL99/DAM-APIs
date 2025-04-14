const { Schema, model } = require('mongoose');

const ZtLabelSchema = new Schema({
  COMPANYID:   { type: String, required: true },
  CEDIID:      { type: String, required: true },
  LABELID:     { type: String, required: true, unique: true },
  LABEL:       { type: String },
  INDEX:       { type: String },
  COLLECTION:  { type: String },
  SECTION:     { type: String },
  SEQUENCE:    { type: Number },
  IMAGE:       { type: String },
  DESCRIPTION: { type: String },
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
  collection: 'ZTLABELS',
  timestamps: false
});

module.exports = model('ZTLABELS', ZtLabelSchema, 'ZTLABELS');