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
async function getAllCatalogsWithValues() {
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

async function catalogs(req) {
  const { labelid, valueid } = req.data || {};
  if (labelid && valueid) {
    return getCatalogByLabelAndValue(req);
  } else if (labelid) {
    return getCatalogByLabel(req);
  } else {
    return getAllCatalogsWithValues();
  }
}

// ─── Nuevo: Crear un catálogo ───────────────────────────
async function createCatalog(req) {
  await connect();
  const payload = req.data.catalog;
  if (!payload || !payload.LABELID) {
    throw new Error('Datos de catálogo inválidos o falta LABELID');
  }

  // Crear etiqueta
  const newLabel = new ZtLabel({
    COMPANYID: payload.COMPANYID,
    CEDIID: payload.CEDIID,
    LABELID: payload.LABELID,
    LABEL: payload.LABEL,
    INDEX: payload.INDEX,
    COLLECTION: payload.COLLECTION,
    SECTION: payload.SECTION,
    SEQUENCE: payload.SEQUENCE,
    IMAGE: payload.IMAGE,
    DESCRIPTION: payload.DESCRIPTION,
    DETAIL_ROW: {
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [payload.DETAIL_ROW_REG || {}]
    }
  });
  await newLabel.save();

//Crear catálogo
  if (Array.isArray(payload.VALUES)) {
    const valueDocs = payload.VALUES.map(v => ({
      COMPANYID: v.COMPANYID,
      CEDIID: v.CEDIID,
      LABELID: payload.LABELID,
      VALUEPAID: v.VALUEPAID,
      VALUEID: v.VALUEID,
      VALUE: v.VALUE,
      ALIAS: v.ALIAS,
      SEQUENCE: v.SEQUENCE,
      IMAGE: v.IMAGE,
      VALUESAPID: v.VALUESAPID,
      DESCRIPTION: v.DESCRIPTION,
      ROUTE: v.ROUTE,
      DETAIL_ROW: {
        ACTIVED: true,
        DELETED: false,
        DETAIL_ROW_REG: [v.DETAIL_ROW_REG || {}]
      }
    }));
    await ZtValue.insertMany(valueDocs);
  }

  return getCatalogByLabel({ data: { labelid: payload.LABELID } });
}

// Actualizar un catálogo
async function updateCatalog(req) {
  await connect();
  const labelid = req._.req.query.labelid;
  if (!labelid) {
    throw new Error('No se proporcionó labelid en la query string');
  }

  const catalogPayload = req.data.catalog;
  if (!catalogPayload) {
    throw new Error('Falta el payload de catálogo en req.data.catalog');
  }

  // Actualizar datos de la etiqueta
  await ZtLabel.updateOne(
    { LABELID: labelid },
    { $set: {
      LABEL: catalogPayload.LABEL,
      INDEX: catalogPayload.INDEX,
      COLLECTION: catalogPayload.COLLECTION,
      SECTION: catalogPayload.SECTION,
      SEQUENCE: catalogPayload.SEQUENCE,
      IMAGE: catalogPayload.IMAGE,
      DESCRIPTION: catalogPayload.DESCRIPTION,
      'DETAIL_ROW.ACTIVED': catalogPayload.DETAIL_ROW.ACTIVED,
      'DETAIL_ROW.DELETED': catalogPayload.DETAIL_ROW.DELETED
    }}
  );

  // Reemplazar todos sus valores: eliminar los antiguos y crear los nuevos
  await ZtValue.deleteMany({ LABELID: labelid });
  if (Array.isArray(catalogPayload.VALUES)) {
    const newValues = catalogPayload.VALUES.map(v => ({
      ...v,
      LABELID: labelid,
      DETAIL_ROW: {
        ACTIVED: v.DETAIL_ROW.ACTIVED,
        DELETED: v.DETAIL_ROW.DELETED,
        DETAIL_ROW_REG: v.DETAIL_ROW.DETAIL_ROW_REG || []
      }
    }));
    await ZtValue.insertMany(newValues);
  }

  // Retornar catálogo actualizado
  return getCatalogByLabel({ data: { labelid } });
}


async function updateCatalog(req) {
    await connect();
    const labelid = req._.req.query.labelid;
    console.log('labelid', labelid);
    if (!labelid) {
      throw new Error('No se proporcionó labelid en la query string');
    }
    const catalogPayload = req.data.catalogs;
    console.log('labelid medio  ', labelid);
    await ZtLabel.updateOne({ LABELID: labelid }, catalogPayload);
    return ZtLabel.findOne({ LABELID: labelid }).lean();
  }
 
// Borrado lógico de catálogo y sus valores
async function logicalDeleteCatalog(req) {
  await connect();
  const labelid = req._.req.query.labelid;
  if (!labelid) {
    throw new Error('No se proporcionó labelid en la query string');
  }

  // Actualizar etiqueta
  const labelResult = await ZtLabel.updateOne(
    { LABELID: labelid },
    { $set: {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': false
    }}
  );

  // Actualizar valores asociados
  const valueResult = await ZtValue.updateMany(
    { LABELID: labelid },
    { $set: {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': false
    }}
  );

  if (labelResult.nModified === 0 && valueResult.nModified === 0) {
    return 'Catálogo no encontrado para borrado lógico';
  }

  // Retornar catálogo con valores ya marcados
  return getCatalogByLabel({ data: { labelid } });
}

// Borrado físico (marcado) de catálogo y sus valores
async function physicalDeleteCatalog(req) {
  await connect();
  const labelid = req._.req.query.labelid;
  if (!labelid) {
    throw new Error('No se proporcionó labelid en la query string');
  }

  // Actualizar etiqueta
  const labelResult = await ZtLabel.updateOne(
    { LABELID: labelid },
    { $set: {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': true
    }}
  );

  // Actualizar valores asociados
  const valueResult = await ZtValue.updateMany(
    { LABELID: labelid },
    { $set: {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': true
    }}
  );

  if (labelResult.nModified === 0 && valueResult.nModified === 0) {
    return 'Catálogo no encontrado para borrado físico';
  }

  return 'Borrado físicamente del catálogo y sus valores';
}


// ─── Funciones para Usuarios ─────────────────────────────
async function getAllUsers() {
  await connect();
  return ZtUser.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
}

async function getUserById(req) {
  await connect();
  const { userid } = req.data;
  if (!userid) return null;
  return ZtUser.findOne({ USERID: userid }).lean();
}

async function createUser(req) {
  await connect();
  const usuarioPlano = JSON.parse(JSON.stringify(req.data.user));
  const nuevoUsuario = await ZtUser.create(usuarioPlano);
  return JSON.parse(JSON.stringify(nuevoUsuario));
}

async function updateUser(req) {
  await connect();
  const userid = req._.req.query.userid;
  if (!userid) {
    throw new Error('No se proporcionó userid en la query string');
  }
  const userPayload = req.data.user;
  await ZtUser.updateOne({ USERID: userid }, userPayload);
  return ZtUser.findOne({ USERID: userid }).lean();
}

async function logicalDeleteUser(req) {
  await connect();
  const userid = req._.req.query.userid;
  if (!userid) {
    throw new Error('No se proporcionó userid en la query string');
  }
  await ZtUser.updateOne(
    { USERID: userid },
    {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': true
    }
  );
  return ZtUser.findOne({ USERID: userid }).lean() || 'Usuario no encontrado para borrado lógico';
}

async function physicalDeleteUser(req) {
  await connect();
  const userid = req._.req.query.userid;
  if (!userid) {
    throw new Error('No se proporcionó userid en la query string');
  }
  const result = await ZtUser.deleteOne({ USERID: userid });
  return result.deletedCount === 1 ? 'Borrado físicamente' : 'Usuario no encontrado para borrado físico';
}

async function users(req) {
  const { userid } = req.data || {};
  if (userid && userid.trim() !== '') {
    const user = await getUserById(req);
    return user ? [user] : [];
  } else {
    return getAllUsers();
  }
}

// ─── Funciones para Roles ────────────────────────────────
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
  const users = await ZtUser.find({ 'ROLES.ROLEID': roleid, 'DETAIL_ROW.ACTIVED': true }).lean();
  return users.map(u => ({
    USERID: u.USERID,
    USERNAME: u.USERNAME,
    COMPANYNAME: u.COMPANYNAME,
    DEPARTMENT: u.DEPARTMENT
  }));
}

async function createRole(req) {
  await connect();
  // Extraemos el objeto role de req.data
  const rolePlano = JSON.parse(JSON.stringify(req.data.role));

  // Aquí podrías validar procesos y privilegios antes de crear
  const nuevoRol = await ZtRole.create(rolePlano);

  return JSON.parse(JSON.stringify(nuevoRol));
}


async function updateRole(req) {
  await connect();
  // roleid se pasa por query string para mantener consistencia con users
  const roleid = req._.req.query.roleid;
  if (!roleid) {
    throw new Error('No se proporcionó roleid en la query string');
  }
  const rolePayload = req.data.role;
  await ZtRole.updateOne({ ROLEID: roleid }, rolePayload);
  return ZtRole.findOne({ ROLEID: roleid }).lean();
}

async function logicalDeleteRole(req) {
  await connect();
  const roleid = req._.req.query.roleid;
  if (!roleid) {
    throw new Error('No se proporcionó roleid en la query string');
  }
  await ZtRole.updateOne(
    { ROLEID: roleid },
    {
      'DETAIL_ROW.ACTIVED': false,
      'DETAIL_ROW.DELETED': true
    }
  );
  return ZtRole.findOne({ ROLEID: roleid }).lean() || 'Rol no encontrado para borrado lógico';
}

async function physicalDeleteRole(req) {
  await connect();
  const roleid = req._.req.query.roleid;
  if (!roleid) {
    throw new Error('No se proporcionó roleid en la query string');
  }
  const result = await ZtRole.deleteOne({ ROLEID: roleid });
  return result.deletedCount === 1 ? 'Borrado físicamente' : 'Rol no encontrado para borrado físico';
}

async function roles(req) {
  const { roleid } = req.data || {};
  if (roleid && roleid.trim() !== '') {
    // Para operaciones GET compuestas: leemos roleid de req.data
    const role = await getRoleById(req);
    if (!role) return null;
    const usersArr = await getUsersByRole(req);
    role.USERS = usersArr;
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
  createCatalog,
  logicalDeleteCatalog,
  updateCatalog,
  physicalDeleteCatalog,
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
