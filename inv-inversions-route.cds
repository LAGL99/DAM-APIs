//1.-importar el modelo de datos de pricehistory desestructurandolos 
using {inv as myinv} from '../models/inv-inversions';


//2.-posteriori  imoekemntamos la ruta de nuestro contolador
//implementacion del controlador logico
@impl: 'srv/api/controllers/inv-inversions-controller.js'

//3.-creacion de la estructura base 
//definicion del servicio
service InversionsRoute @(path:'/api/inv'){

    //4.-instanciar la entidad de price history
    entity priceshistory as projection on myinv.priceshistory;
    entity strategies as projection on myinv.strategies;
    entity ztlabels as projection on myinv.ztlabels;
    entity ztvalues as projection on myinv.ztvalues;

    //5.- definir la ruta d ela API GEt ALL price history
    //definir la endpont 
    //localhost:333/api/inv/pricehistory/getall


    // no olvidar que el nombre de la funcion debe ser el mismo que el del path 

    @Core.Description: 'get-all-prices-history'
    @path :'getall'
    function getall()
    returns array of priceshistory;


    @Core.Description: 'add-one-prices-history'
    @path :'addone'
    function addone(prices : priceshistory)
    returns array of priceshistory;

    @Core.Description: 'update-one-prices-history'
    @path :'updateone'
    function updateone(prices : priceshistory)
    returns array of priceshistory;

    @Core.Description: 'delete-one-prices-history'
    @path :'delteone'
    function deleteone(prices : priceshistory)
    returns array of priceshistory;

    @Core.Description: 'get-all-catalogs'
    @path: 'catalogs'
    function catalogs() 
    returns array of ztlabels;

     // Definir la ruta para obtener el catálogo por 'labelid'
  @Core.Description: 'Get catalog by labelid'
  @path: 'getcatalogbyid'  // Asegúrate de que la ruta reciba 'labelid'
  function getcatalogbyid(labelid: String) 
  returns array of ztlabels;

    @Core.Description: 'Get catalog by labelid and valueid'
@path: 'getcatalogbyidandvalueid'
function getcatalogbyidandvalueid(LabelId: String, ValueId: String) returns array of ztlabels;



    //localhost:333/api/inv/pricehistory/getone

    //localhost:333/api/inv/pricehistory/deleteone

    //localhost:333/api/inv/pricehistory/

    //localhost:333/api/inv/pricehistory/getall

    //localhost:333/api/inv/pricehistory/getall

};




