const ztpriceshistory = require("../models/mongodb/ztpriceshistory-model");
const ZTLABELS = require("../models/mongodb/ztlabels-model");
const ZTVALUES = require("../models/mongodb/ztvalues-model");
const mongoose = require("mongoose");

async function GetAllPricesHistory(req) {
  try {
    const idprices = parseInt(req.req.query?.idprices);
    const iniVolume = parseFloat(req.req.query?.iniVolume);
    const endVolume = parseFloat(req.req.query?.endVolume);
    let priceshistorylist;
    if (idprices >= 0) {
      priceshistorylist = await ztpriceshistory
        .findOne({ ID: idprices })
        .lean();
    } else if (iniVolume >= 0 && endVolume >= 0) {
      priceshistorylist = await ztpriceshistory
        .find({
          VOLUME: { $gte: iniVolume, $lte: endVolume },
        })
        .lean();
    } else {
      priceshistorylist = await ztpriceshistory.find().lean();
    }

    return priceshistorylist;
  } catch (error) {
    return error;
  } finally {
  }
}

//post one que llamamos add one en price history
async function AddOnePricesHistory(req) {
  try {
    //const body = req.req.body
    const newPrices = req.req.body.prices;
    //console.log(idprices)
    let priceshistorylist;

    priceshistorylist = await ztpriceshistory.insertMany(newPrices, {
      order: true,
    });
    //http://localhost:3020/api/inv/addone

    return JSON.parse(JSON.stringify(pricesHistory));
  } catch (error) {
    return error;
  } finally {
  }
}

async function UpdateOnePricesHistory(req) {
  try {
    //const body = req.req.body
    const idprices = parseInt(req.req.query?.idprices);
    const newPrices = req.req.body.prices;

    let priceshistorylist;

    priceshistorylist = await ztpriceshistory.updateMany(
      { ID: idprices },
      newPrices
    );
    //http://localhost:3020/api/inv/updateone

    return JSON.parse(JSON.stringify(pricesHistory));
  } catch (error) {
    return error;
  } finally {
  }
}

async function DeleteOnePricesHistory(req) {
  try {
    //const body = req.req.body
    const idprices = parseInt(req.req.query?.idprices);
    let priceshistorylist;
    priceshistorylist = await ztpriceshistory.deleteOne({ ID: idprices });
    //http://localhost:3020/api/inv/deleteone

    return priceshistorylist;
  } catch (error) {
    return error;
  } finally {
  }
}

async function GetAllCatalogs(req) {
  try {
    result = await mongoose.connection
        //consultas agregadas
      .collection("ZTLABELS").aggregate([
        {
            //para hacer un query de la tabla ZTLABELS 
          $lookup: {
            //Nombre de la coleccion donde se va a buscar
            from: "ZTVALUES",
            localField: "LABELID",
            foreignField: "LABELID",
            //Nombre de las coincidencias puede ser cualquier nombre
            as: "VALUES",
          },
        },
      ])
      .toArray();
    return result;
  } catch (error) {
    console.error("Error en GetAllCatalogs:", error);
    return { error: "Error al obtener los catálogos", details: error };
  }
}

async function GetCatalogByLabelIdAndValueId(labelId, valueId) {
  try {
    const result = await mongoose.connection
      .collection("ZTLABELS")
      .aggregate([
        {
          $match: { LABELID: labelId }
        },
        {
          $lookup: {
            from: "ZTVALUES",
            let: { label_id: "$LABELID" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$LABELID", "$$label_id"] },
                      { $eq: ["$VALUEID", valueId] }
                    ]
                  }
                }
              }
            ],
            as: "VALUES"
          }
        },
        {
          $match: {
            VALUES: { $ne: [] } // <-- Filtra solo si hay resultados en VALUES
          }
        }
      ])
      .toArray();

    return result;
  } catch (error) {
    console.error("Error al obtener el catálogo por LABELID y VALUEID:", error);
    return { error: "Error al obtener el catálogo", details: error };
  }
}


async function GetCatalogById(labelId) {
  try {
    // Realizar el query a la base de datos para obtener el catálogo
    const result = await myinv.collection('ZTLABELS').aggregate([
      {
        $match: { LABELID: labelId }  // Filtramos por el labelId
      },
      {
        $lookup: {
          from: 'ZTVALUES',  // Colección a la que queremos hacer lookup
          localField: 'LABELID',  // Campo local para hacer match
          foreignField: 'LABELID',  // Campo en la colección externa
          as: 'VALUES'  // Resultados de la colección 'ZTVALUES' se guardan en 'VALUES'
        }
      }
    ]).toArray();

    return result;  // Devolver el resultado del catálogo encontrado
  } catch (error) {
    // Si ocurre un error al hacer la consulta, se lanza el error
    console.error("Error en GetCatalogByLabelId:", error);
    throw new Error('Error al obtener el catálogo');
  }
}









module.exports = {
  GetAllPricesHistory,
  AddOnePricesHistory,
  UpdateOnePricesHistory,
  DeleteOnePricesHistory,
  GetAllCatalogs,
  GetCatalogByLabelIdAndValueId,
  GetCatalogById
};
