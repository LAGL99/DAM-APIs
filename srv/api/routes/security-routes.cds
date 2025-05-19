using { security as s } from '../models/security';

@impl: 'srv/api/controllers/security-controller.js'
service SecurityRoute @(path:'/api/security') {

  // ─── CATÁLOGOS ─────────────────────────────────────────
  entity Catalog as projection on s.Catalog;
  entity Value as projection on s.Value;
  entity CatalogWithValues as projection on s.CatalogWithValues;

  @Core.Description: 'Obtener catálogos. Filtra por labelid y valueid si se proporcionan (en el body de la petición)'
  @path: 'catalogs'
  function catalogs(labelid: String, valueid: String) returns array of CatalogWithValues;

  @Core.Description: 'Borrado lógico de catalogo'
  @path: 'deletecatalogs'
  action deletecatalogs(labelid: String) returns String;
  
  @Core .Description: 'Actualizacion de catalogo'
  @path: 'updatecatalogs'
  action updatecatalogs(labelid: String, catalogs : Catalog) returns Catalog; 

  @Core.Description: 'Eliminado físico de catalogo'
  @path: 'removecatalog'
  action removecatalog(labelid: String) returns String;
  // ─── USUARIOS ─────────────────────────────────────────
  entity User as projection on s.User;
  @Core.Description: 'Obtener usuarios o usuario por ID (en el body se envía userid)'
  @path: 'users'
  function users(userid: String) returns array of User;
  
  @Core.Description: 'Crear usuario'
  @path: 'createuser'
  action createuser(user: User) returns User;
  
  @Core.Description: 'Actualizar usuario'
  @path: 'users'
  action updateuser(userid: String, user: User) returns User;
  
  @Core.Description: 'Borrado lógico de usuario'
  @path: 'deleteusers'
  action deleteusers(userid: String) returns String;
  
  @Core.Description: 'Eliminado físico de usuario'
  @path: 'removeusers'
  action removeuser(userid: String) returns String;

  // ─── ROLES ─────────────────────────────────────────
  entity Role as projection on s.Role;
  @Core.Description: 'Obtener roles o un rol por ID (con usuarios asociados si se envía roleid)'
  @path: 'roles'
  function roles(roleid: String) returns array of Role;
  
  @Core.Description: 'Crear rol'
  @path: 'roles'
  action createrole(role: Role) returns Role;
  
  @Core.Description: 'Actualizar rol'
  @path: 'roles'
  action updaterole(roleid: String, role: Role) returns Role;
  
  @Core.Description: 'Borrado lógico de rol'
  @path: 'deleteroles'
  action deleteroles(roleid: String) returns String;
  
  @Core.Description: 'Eliminado físico de rol'
  @path: 'deleteroles'
  action removerole(roleid: String) returns String;

  // ─── VISTAS ─────────────────────────────────────────
  entity View  as projection on s.View;
  @Core.Description: 'Crear vista'
  @path: 'view'
  action createview(view: View) returns View;
  
  @Core.Description: 'Actualizar vista'
  @path: 'view'
  action updateview(valueid: String, view: View) returns View;
  
  @Core.Description: 'Borrado lógico de vista'
  @path: 'deleteview'
  action deleteview(valueid: String) returns String;
  
  @Core.Description: 'Eliminado físico de vista'
  @path: 'deleteview'
  action removeview(valueid: String) returns String;

  // ─── PROCESOS ─────────────────────────────────────────
  entity Process as projection on s.Process;
  @Core.Description: 'Crear proceso'
  @path: 'processes'
  action createprocess(proc: Process) returns Process;
  
  @Core.Description: 'Actualizar proceso'
  @path: 'values/processes'
  action updateprocess(valueid: String, proc: Process) returns Process;
  
  @Core.Description: 'Borrado lógico de proceso'
  @path: 'deleteprocesses'
  action deleteprocess(valueid: String) returns String;
  
  @Core.Description: 'Eliminado físico de proceso'
  @path: 'deleteprocesses'
  action removeprocess(valueid: String) returns String;
}