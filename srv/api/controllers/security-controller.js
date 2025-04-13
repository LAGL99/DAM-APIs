// srv/api/controllers/security-controller.js
const cds = require('@sap/cds');
const svc = require('../services/security-service');

class SecurityController extends cds.ApplicationService {
  async init() {
    // 🔹 Catálogos
    this.on('getAllCatalogsWithValues', async (req) => {
      return svc.getAllCatalogsWithValues(req);
    });
    this.on('getCatalogByLabel', async (req) => {
      return svc.getCatalogByLabel(req);
    });
    this.on('getCatalogByLabelAndValue', async (req) => {
      return svc.getCatalogByLabelAndValue(req);
    });

    // 🔹 Usuarios
    this.on('getAllUsers', async (req) => {
      return svc.getAllUsers(req);
    });
    this.on('getUserById', async (req) => {
      return svc.getUserById(req);
    });
    this.on('createUser', async (req) => {
      return svc.createUser(req);
    });
    this.on('updateUser', async (req) => {
      return svc.updateUser(req);
    });
    this.on('logicDeleteUser', async (req) => {
      return svc.logicalDeleteUser(req);
    });
    this.on('deleteUser', async (req) => {
      return svc.physicalDeleteUser(req);
    });

    // 🔹 Roles
    this.on('getAllRoles', async (req) => {
      return svc.getAllRoles(req);
    });
    this.on('getRoleById', async (req) => {
      return svc.getRoleById(req);
    });
    this.on('createRole', async (req) => {
      return svc.createRole(req);
    });
    this.on('updateRole', async (req) => {
      return svc.updateRole(req);
    });
    this.on('logicDeleteRole', async (req) => {
      return svc.logicalDeleteRole(req);
    });
    this.on('deleteRole', async (req) => {
      return svc.physicalDeleteRole(req);
    });
    this.on('getUsersByRole', async (req) => {
      return svc.getUsersByRole(req);
    });


    return await super.init();
  }
}

module.exports = SecurityController;
