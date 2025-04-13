// srv/services/security-service.js
const mongoose = require('mongoose');
const ZtLabel = require('../models/mongodb/ztlabels-model');
const ZtValue = require('../models/mongodb/ztvalues-model');
const ZtUser  = require('../models/mongodb/ztusers-model');
const ZtRole  = require('../models/mongodb/ztroles-model');

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}

// ── CATALOGS ───────────────────────────────────────────
async function getAllCatalogsWithValues(req) {
  await connect();
  const labels = await ZtLabel.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
  return Promise.all(labels.map(async lbl => {
    const vals = await ZtValue.find({ LABELID: lbl.LABELID, 'DETAIL_ROW.ACTIVED': true }).lean();
    return { ...lbl, VALUES: vals };
  }));
}

async function getCatalogByLabel(req) {
  await connect();
  const { labelid } = req.data;
  const lbl = await ZtLabel.findOne({ LABELID: labelid }).lean();
  const vals = await ZtValue.find({ LABELID: labelid }).lean();
  return { ...lbl, VALUES: vals };
}

async function getCatalogByLabelAndValue(req) {
  await connect();
  const { labelid, valueid } = req.data;
  const lbl = await ZtLabel.findOne({ LABELID: labelid }).lean();
  const val = await ZtValue.findOne({ LABELID: labelid, VALUEID: valueid }).lean();
  return { ...lbl, VALUES: [val] };
}

// ── USERS ──────────────────────────────────────────────
async function getAllUsers() {
  await connect();
  return ZtUser.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
}

async function getUserById(req) {
  await connect();
  return ZtUser.findOne({ USERID: req.data.userid }).lean();
}

async function createUser(req) {
  await connect();
  return ZtUser.create(req.data);
}

async function updateUser(req) {
  await connect();
  const { userid } = req.params;
  await ZtUser.updateOne({ USERID: userid }, req.data);
  return ZtUser.findOne({ USERID: userid }).lean();
}

async function logicalDeleteUser(req) {
  await connect();
  await ZtUser.updateOne({ USERID: req.data.userid }, {
    'DETAIL_ROW.ACTIVED': false,
    'DETAIL_ROW.DELETED': true
  });
  return 'Borrado lógicamente';
}

async function physicalDeleteUser(req) {
  await connect();
  await ZtUser.deleteOne({ USERID: req.data.userid });
  return 'Borrado físicamente';
}

// ── ROLES ──────────────────────────────────────────────
async function getAllRoles() {
  await connect();
  return ZtRole.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
}

async function getRoleById(req) {
  await connect();
  return ZtRole.findOne({ ROLEID: req.data.roleid }).lean();
}

async function getUsersByRole(req) {
  await connect();
  const users = await ZtUser.find({ 'ROLES.ROLEID': req.data.roleid }).lean();
  return users.map(u => ({
    USERID: u.USERID,
    USERNAME: u.USERNAME,
    COMPANYNAME: u.COMPANYNAME,
    DEPARTMENT: u.DEPARTMENT
  }));
}

async function createRole(req) {
  await connect();
  return ZtRole.create(req.data);
}

async function updateRole(req) {
  await connect();
  await ZtRole.updateOne({ ROLEID: req.params.roleid }, req.data);
  return ZtRole.findOne({ ROLEID: req.params.roleid }).lean();
}

async function logicalDeleteRole(req) {
  await connect();
  await ZtRole.updateOne({ ROLEID: req.data.roleid }, {
    'DETAIL_ROW.ACTIVED': false,
    'DETAIL_ROW.DELETED': true
  });
  return 'Borrado lógicamente';
}

async function physicalDeleteRole(req) {
  await connect();
  await ZtRole.deleteOne({ ROLEID: req.data.roleid });
  return 'Borrado físicamente';
}

module.exports = {
  // Catalogs
  getAllCatalogsWithValues,
  getCatalogByLabel,
  getCatalogByLabelAndValue,

  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  logicalDeleteUser,
  physicalDeleteUser,

  // Roles
  getAllRoles,
  getRoleById,
  getUsersByRole,
  createRole,
  updateRole,
  logicalDeleteRole,
  physicalDeleteRole
};
