/*
// 1.- Importar el modelo de datos desestructurado
using {sec} from '../models/sec-users';

// 2.- Implementación del controlador lógico
@impl: 'srv/api/controllers/sec-users-controller.js'

// 3.- Definición del servicio para la ruta de usuarios
service UsersRoute @(path: '/api/users') {

    // 4.- Entidades a proyectar (puedes agregar más si las tienes)
    entity users as projection on mysec.users;
    entity roles as projection on mysec.roles;
    entity privileges as projection on mysec.privileges;

    // 5.- Métodos para USERS

    @Core.Description: 'get-all-users'
    @path: 'getall'
    function getall()
    returns array of users;

    @Core.Description: 'add-one-user'
    @path: 'addone'
    function addone(user: users)
    returns array of users;

    @Core.Description: 'update-one-user'
    @path: 'updateone'
    function updateone(user: users)
    returns array of users;

    @Core.Description: 'delete-one-user'
    @path: 'deleteone'
    function deleteone(user: users)
    returns array of users;

    // Lo mismo puedes hacer para roles, privilegios, etc.
}
*/

/*
// 1. Importar el modelo de datos desde el archivo original
using { sec } from '../models/sec-users';

// 2. Especificar el controlador que implementará esta ruta
@impl: 'srv/api/controllers/sec-users-controller.js'

// 3. Definir el servicio con la ruta base de la API
service UsersRoute @(path: '/api/sec') {

    // 4. Entidades a proyectar (puedes agregar más si las tienes)
    entity users as projection on sec.Users;
    entity roles as projection on sec.Roles;
    entity privileges as projection on sec.Privileges;

    // 5. Operaciones básicas (puedes personalizar estos endpoints)
    
    @Core.Description: 'get-all-users'
    @path: 'getall'
    function getall()
    returns array of users;

    @Core.Description: 'add-one-user'
    @path: 'addone'
    function addone(user: users)
    returns array of users;

    @Core.Description: 'update-one-user'
    @path: 'updateone'
    function updateone(user: users)
    returns array of users;

    @Core.Description: 'delete-one-user'
    @path: 'deleteone'
    function deleteone(user: users)
    returns array of users;
}
*/
/*
// 1. Importar el modelo de datos desde el archivo original
using { sec } from '../models/sec-users';

// 2. Especificar el controlador que implementará esta ruta
@impl: 'srv/api/controllers/sec-users-controller.js'

// 3. Definir el servicio con la ruta base de la API
service UsersRoute @(path: '/api/sec') {

    // 4. Entidades a proyectar
    entity users as projection on sec.Users;
    entity roles as projection on sec.Roles;
    entity privileges as projection on sec.Privileges;

    // 5. Operaciones básicas

    @Core.Description: 'get-all-users'
    @path: 'getall'
    @http.method: 'GET'  // Definimos el método HTTP como GET
    function getall()
    returns array of users;

    @Core.Description: 'add-one-user'
    @path: 'addone'
    @http.method: 'POST'  // Definimos el método HTTP como POST
    function addone(user: users)
    returns array of users;

    @Core.Description: 'update-one-user'
    @path: 'updateone'
    @http.method: 'PUT'  // Definimos el método HTTP como PUT
    function updateone(user: users)
    returns array of users;

    @Core.Description: 'delete-one-user'
    @path: 'deleteone'
    @http.method: 'DELETE'  // Definimos el método HTTP como DELETE
    function deleteone(user: users)
    returns array of users;
}
*/
/*
// 1. Importar el modelo de datos desde el archivo original
using { sec } from '../models/sec-users';

// 2. Especificar el controlador que implementará esta ruta
@impl: 'srv/api/controllers/sec-users-controller.js'

// 3. Definir el servicio con la ruta base de la API
service UsersRoute @(path: '/api/sec') {

    // 4. Entidades a proyectar
    entity users as projection on sec.Users;
    entity roles as projection on sec.Roles;
    entity privileges as projection on sec.Privileges;

    // 5. Operaciones básicas

    @Core.Description: 'get-all-users'
    @path: 'getall'
    @http.method: 'GET'  // Método HTTP GET
    function getall()
    returns array of users;

    @Core.Description: 'add-one-user'
    @path: 'addone'
    @http.method: 'POST'  // Método HTTP POST
    function addone(user: users)
    returns array of users;

    @Core.Description: 'update-one-user'
    @path: 'updateone'
    @http.method: 'PUT'  // Método HTTP PUT
    function updateone(user: users)
    returns array of users;

    @Core.Description: 'delete-one-user'
    @path: 'deleteone'
    @http.method: 'DELETE'  // Método HTTP DELETE
    function deleteone(user: users)
    returns array of users;

}
*/

// 1. Importar el modelo de datos desde el archivo original
using { sec } from '../models/sec-users';

// 2. Especificar el controlador que implementará esta ruta
@impl: 'srv/api/controllers/sec-users-controller.js'

// 3. Definir el servicio con la ruta base de la API
service UsersRoute @(path: '/api/sec') {

    // 4. Entidades a proyectar
    entity users as projection on sec.Users;
    entity roles as projection on sec.Roles;
    entity privileges as projection on sec.Privileges;

    // 5. Operaciones básicas usando `action` (no `function`)
    
    @Core.Description: 'get-all-users'
    action getall()
    returns array of users;

    @Core.Description: 'add-one-user'
    action addone(user: users)
    returns array of users;

    @Core.Description: 'update-one-user'
    action updateone(user: users)
    returns array of users;

    @Core.Description: 'delete-one-user'
    action deleteone(user: users)
    returns array of users;
}
