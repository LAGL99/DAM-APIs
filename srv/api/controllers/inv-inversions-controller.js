//1.-importacion de las librerias
const cds = require("@sap/cds");

//2.-importar el servicio
const { simulateSupertrend, reversionSimple } = require("../services/inv-inversions-service");

//3.- estructura princiapl  de la clas de contorller

class inversionsClass extends cds.ApplicationService {
  //4.-iniciiarlizarlo de manera asincrona
  async init() {
    this.on("getall", async (req) => {
      return GetAllPricesHistory(req);
      //requesamso ala aruta
    });

    this.on("addone", async (req) => {
      return AddOnePricesHistory(req);
      //requesamso ala aruta
    });

    this.on("updateone", async (req) => {
      return UpdateOnePricesHistory(req);
      //requesamso ala aruta
    });

    this.on("deleteone", async (req) => {
      return DeleteOnePricesHistory(req);
      //requesamso ala aruta
    });

    this.on("simulation", async (req) => {
      try {
        const { strategy } = req?.req?.query || {};
        const body = req?.req?.body?.simulation || {}; // Aquí está todo el body
        console.log(body);

        if (!strategy) {
          throw new Error(
            "Falta el parámetro requerido: 'strategy' en los query parameters."
          );
        }
        if (Object.keys(body).length === 0) {
          throw new Error(
            "El cuerpo de la solicitud no puede estar vacío. Se esperan parámetros de simulación."
          );
        }

        let result = "";
        switch (strategy.toLowerCase()) {
          case "reversionsimple":

            result = await reversionSimple(body);

            return result; 
           case "supertrend":

            result = await simulateSupertrend(body);

            return result; 

          // Aquí puedes agregar más estrategias en el futuro:
          // case 'otraEstrategia':
          //   return await otraFuncionDeEstrategia(body);

          default:
            throw new Error(`Estrategia no reconocida: ${strategy}`);
        }
      } catch (error) {
        console.error("Error en el controlador de simulación:", error);
        // Retorna un objeto de error que el framework pueda serializar a JSON.
        return {
          ERROR: true,
          MESSAGE:
            error.message || "Error al procesar la solicitud de simulación.",
        };
      }
      // );
    });
    return await super.init();
  }
}

module.exports = inversionsClass;
