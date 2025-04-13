using { security as s } from '../models/security';

@impl: 'srv/api/controllers/security-controller.js'
service SecurityRoute @(path:'/api/security') {

  // ─── CATÁLOGOS ────────────────────────────────────────────────────────────────

  entity Catalog as projection on s.Catalog;
  entity Value as projection on s.Value;
  entity CatalogWithValues as projection on s.CatalogWithValues;

  @Core.Description: 'Get all catalogs with their values'
  @path: 'catalogs/getall'
  function getAllCatalogsWithValues()
    returns array of CatalogWithValues;

  @Core.Description: 'Get catalog by labelid with its values'
  @path: 'catalogs/getbylabel'
  function getCatalogByLabel(labelid: String)
    returns CatalogWithValues;

  @Core.Description: 'Get catalog by labelid & valueid'
  @path: 'catalogs/getbylabelandvalue'
  function getCatalogByLabelAndValue(labelid: String, valueid: String)
    returns Value;


  // ─── USUARIOS ────────────────────────────────────────────────────────────────

  entity User as projection on s.User;

  @Core.Description: 'Get all users'
  @path: 'users/getall'
  function getAllUsers()
    returns array of User;

  @Core.Description: 'Get user by ID'
  @path: 'users/getbyid'
  function getUserById(userid: String)
    returns User;

  @Core.Description: 'Create a new user'
  @path: 'users/create'
  function createUser(user: User)
    returns User;

  @Core.Description: 'Update user'
  @path: 'users/update'
  function updateUser(userid: String, user: User)
    returns User;

  @Core.Description: 'Logical delete user'
  @path: 'users/logicdelete'
  function logicDeleteUser(userid: String)
    returns String;

  @Core.Description: 'Physical delete user'
  @path: 'users/delete'
  function deleteUser(userid: String)
    returns String;


  // ─── ROLES ──────────────────────────────────────────────────────────────────

  entity Role as projection on s.Role;

  @Core.Description: 'Get all roles'
  @path: 'roles/getall'
  function getAllRoles()
    returns array of Role;

  @Core.Description: 'Get role by ID'
  @path: 'roles/getbyid'
  function getRoleById(roleid: String)
    returns Role;

  @Core.Description: 'Create a new role'
  @path: 'roles/create'
  function createRole(role: Role)
    returns Role;

  @Core.Description: 'Update role'
  @path: 'roles/update'
  function updateRole(roleid: String, role: Role)
    returns Role;

  @Core.Description: 'Logical delete role'
  @path: 'roles/logicdelete'
  function logicDeleteRole(roleid: String)
    returns String;

  @Core.Description: 'Physical delete role'
  @path: 'roles/delete'
  function deleteRole(roleid: String)
    returns String;

  @Core.Description: 'Get users by role'
  @path: 'roles/getusers'
  function getUsersByRole(roleid: String)
    returns array of User;


  // ─── VISTAS ─────────────────────────────────────────────────────────────────

  entity View as projection on s.View;

  @Core.Description: 'Create a view'
  @path: 'view/create'
  function createView(view: View)
    returns View;

  @Core.Description: 'Update a view'
  @path: 'view/update'
  function updateView(valueid: String, view: View)
    returns View;

  @Core.Description: 'Logical delete view'
  @path: 'view/logicdelete'
  function logicDeleteView(valueid: String)
    returns String;

  @Core.Description: 'Physical delete view'
  @path: 'view/delete'
  function deleteView(valueid: String)
    returns String;


  // ─── PROCESOS ────────────────────────────────────────────────────────────────

  entity Process as projection on s.Process;

  @Core.Description: 'Create a process'
  @path: 'process/create'
  function createProcess(proc: Process)
    returns Process;

  @Core.Description: 'Update a process'
  @path: 'process/update'
  function updateProcess(valueid: String, proc: Process)
    returns Process;

  @Core.Description: 'Logical delete process'
  @path: 'process/logicdelete'
  function logicDeleteProcess(valueid: String)
    returns String;

  @Core.Description: 'Physical delete process'
  @path: 'process/delete'
  function deleteProcess(valueid: String)
    returns String;
}
