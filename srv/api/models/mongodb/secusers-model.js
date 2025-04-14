const mongoose = require("mongoose");

const privilegeSchema = new mongoose.Schema({
  PRIVILEGEID: String,
  PRIVILEGENAME: String,
});

const processSchema = new mongoose.Schema({
  PROCESSID: String,
  PROCESSNAME: String,
  APPLICATIONID: String,
  APLICATIONNAME: String,
  VIEWID: String,
  VIEWNAME: String,
  PRIVILEGES: [privilegeSchema],
});

const detailRowRegSchema = new mongoose.Schema({
  CURRENT: Boolean,
  REGDATE: Date,
  REGTIME: Date,
  REGUSER: String,
});

const detailRowSchema = new mongoose.Schema({
  ACTIVED: Boolean,
  DELETED: Boolean,
  DETAIL_ROW_REG: [detailRowRegSchema],
});

const roleSchema = new mongoose.Schema({
  ROLEID: String,
  ROLEIDSAP: String,
  ROLENAME: String,
  DESCRIPTION: String,
  PROCESSES: [processSchema],
  DETAIL_ROW: detailRowSchema,
});

const userSchema = new mongoose.Schema({
  USERID: { type: String, required: true, unique: true },
  PASSWORD: String,
  USERNAME: String,
  ALIAS: String,
  FIRSTNAME: String,
  LASTNAME: String,
  BIRTHDAYDATE: String,
  COMPANYID: Number,
  COMPANYNAME: String,
  COMPANYALIAS: String,
  CEDIID: String,
  EMPLOYEEID: String,
  EMAIL: String,
  PHONENUMBER: String,
  EXTENSION: String,
  DEPARTMENT: String,
  FUNCTION: String,
  STREET: String,
  POSTALCODE: Number,
  CITY: String,
  REGION: String,
  STATE: String,
  COUNTRY: String,
  AVATAR: String,
  ROLES: [roleSchema],
  DETAIL_ROW: detailRowSchema,
});

module.exports = mongoose.model("Users", userSchema);
