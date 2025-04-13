const mongoose = require('mongoose');
const ZtLabel = require('../models/mongodb/ztlabels-model');
const ZtValue = require('../models/mongodb/ztvalues-model');
const ZtUser  = require('../models/mongodb/ztusers-model');
const ZtRole  = require('../models/mongodb/ztroles-model');

// Función para conectar a MongoDB
async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}

// ─── Funciones para Catálogos ───────────────────────────
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
  if (!labelid) return null;
  const lbl = await ZtLabel.findOne({ LABELID: labelid }).lean();
  const vals = await ZtValue.find({ LABELID: labelid }).lean();
  return { ...lbl, VALUES: vals };
}

async function getCatalogByLabelAndValue(req) {
  await connect();
  const { labelid, valueid } = req.data;

  if (!labelid || !valueid) return null;

  const lbl = await ZtLabel.findOne({ LABELID: labelid }).lean();
  if (!lbl) return null;

  const val = await ZtValue.findOne({ LABELID: labelid, VALUEID: valueid }).lean();
  if (!val) return null;

  return {
    ...lbl,
    VALUES: [val]
  };
}


// Función compuesta para catálogos
async function catalogs(req) {
  const { labelid, valueid } = req.data || {};
  if (labelid && valueid) {
    return getCatalogByLabelAndValue(req);
  } else if (labelid) {
    return getCatalogByLabel(req);
  } else {
    return getAllCatalogsWithValues(req);
  }
}

// ─── Funciones para Usuarios ─────────────────────────────
async function getAllUsers() {
  await connect();
  return ZtUser.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
}

async function getUserById(req) {
  await connect();
  const { userid } = req.data;
  console.log(userid);
  if (!userid) return null;
  return ZtUser.findOne({ USERID: userid }).lean();
}

async function createUser(req) {
  try {
    await connect();
    const usuarioPlano = JSON.parse(JSON.stringify(req.data.user));
    const nuevoUsuario = await ZtUser.create(usuarioPlano);
    return JSON.parse(JSON.stringify(nuevoUsuario));
  } catch (error) {
    throw error;
  }
}


async function updateUser(req) {
  await connect();

  // 1) Extrae userid de la query string cruda
  const userid = req._.req.query.userid;
  console.log('updateUser.userid from query:', userid);

  if (!userid) {
    throw new Error('No se proporcionó userid en la query string');
  }

  // 2) El payload completo (body) está en req.data
  const userPayload = req.data.user;
  console.log('updateUser.user payload:', userPayload);

  // 3) Actualizas el documento
  await ZtUser.updateOne(
    { USERID: userid },
    userPayload
  );

  // 4) Devuelves el usuario actualizado
  return ZtUser.findOne({ USERID: userid }).lean();
}


async function logicalDeleteUser(req) {
  await connect();

  // 1) Extrae userid de la query string cruda
  const userid = req._.req.query.userid;
  console.log('logicalDeleteUser.userid from query:', userid);

  if (!userid) {
    throw new Error('No se proporcionó userid en la query string');
  }

  // 2) Realiza el borrado lógico
  await ZtUser.updateOne(
    { USERID: userid },
    {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': true
    }
  );

  // 3) Opcional: devuelve el registro actualizado o un mensaje
  const usuarioActualizado = await ZtUser.findOne({ USERID: userid }).lean();
  return usuarioActualizado
    ? usuarioActualizado
    : 'Usuario no encontrado para borrado lógico';
}

async function physicalDeleteUser(req) {
  await connect();

  // 1) Extrae userid de la query string cruda
  const userid = req._.req.query.userid;
  console.log('physicalDeleteUser.userid from query:', userid);

  if (!userid) {
    throw new Error('No se proporcionó userid en la query string');
  }

  // 2) Realiza el borrado físico
  const result = await ZtUser.deleteOne({ USERID: userid });

  // 3) Devuelve un mensaje según el resultado
  if (result.deletedCount === 1) {
    return 'Borrado físicamente';
  } else {
    return 'Usuario no encontrado para borrado físico';
  }
}


// Función compuesta para usuarios: si se envía "userid" se obtiene un usuario, de lo contrario se retornan todos
async function users(req) {
  const { userid } = req.data || {};
  if (userid && userid.trim() !== '') {
    const user = await getUserById(req);
    return user ? [user] : [];
  } else {
    return getAllUsers();
  }
}

// ─── Funciones para Roles ─────────────────────────────
async function getAllRoles() {
  await connect();
  return ZtRole.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
}

async function getRoleById(req) {
  await connect();
  const { roleid } = req.data;
  if (!roleid) return null;
  return ZtRole.findOne({ ROLEID: roleid }).lean();
}

async function getUsersByRole(req) {
  await connect();
  const { roleid } = req.data;
  if (!roleid) return [];
  const users = await ZtUser.find({ 'ROLES.ROLEID': roleid }).lean();
  return users.map(u => ({
    USERID: u.USERID,
    USERNAME: u.USERNAME,
    COMPANYNAME: u.COMPANYNAME,
    DEPARTMENT: u.DEPARTMENT
  }));
}

async function createRole(req) {
  await connect();
  // Aquí se podría validar la existencia de procesos y privilegios.
  return ZtRole.create(req.data);
}

async function updateRole(req) {
  await connect();
  const { roleid } = req.params; // se espera que roleid se pase en params
  await ZtRole.updateOne({ ROLEID: roleid }, req.data);
  return ZtRole.findOne({ ROLEID: roleid }).lean();
}

async function logicalDeleteRole(req) {
  await connect();
  const { roleid } = req.data;
  if (!roleid) return 'No se proporcionó roleid';
  await ZtRole.updateOne({ ROLEID: roleid }, {
    'DETAIL_ROW.ACTIVED': false,
    'DETAIL_ROW.DELETED': true
  });
  return 'Borrado lógicamente';
}

async function physicalDeleteRole(req) {
  await connect();
  const { roleid } = req.data;
  if (!roleid) return 'No se proporcionó roleid';
  await ZtRole.deleteOne({ ROLEID: roleid });
  return 'Borrado físicamente';
}

// Función compuesta para roles: si se envía "roleid" se retorna el rol junto con los usuarios asociados; de lo contrario, se retornan todos los roles
async function roles(req) {
  const { roleid } = req.data || {};
  if (roleid && roleid.trim() !== '') {
    const role = await getRoleById(req);
    const usersArr = await getUsersByRole(req);
    if (role) {
      role.USERS = usersArr;
    }
    return role;
  } else {
    return getAllRoles();
  }
}

module.exports = {
  // Catálogos
  getAllCatalogsWithValues,
  getCatalogByLabel,
  getCatalogByLabelAndValue,
  catalogs,
  // Usuarios
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  logicalDeleteUser,
  physicalDeleteUser,
  users,
  // Roles
  getAllRoles,
  getRoleById,
  getUsersByRole,
  createRole,
  updateRole,
  logicalDeleteRole,
  physicalDeleteRole,
  roles
};
