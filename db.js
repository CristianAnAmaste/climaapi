const sql = require('mssql');

// Configuración de la conexión a la base de datos
//debe estar en otro lugar, con esto me conecto a la base de datos
const dbConfig = {
  user: 'sa',
  password: 'Atacama11380',
  server: 'localhost', 
  database: 'meteofeal',
  options: {
    encrypt: false, 
    trustServerCertificate: true 
  }
};

async function getApiData() {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query('SELECT name_api, api_secret_key, api_key FROM data_api');
      if (result.recordset.length > 0) {
        return result.recordset[0];
      } else {
        throw new Error('No se encontraron datos en la tabla data_api');
      }
    } catch (error) {
      console.error('Error al obtener datos de la base de datos:', error);
    } finally {
      await sql.close();
    }
  }
  
  async function getEstacionData(station) {
    try {
      await sql.connect(dbConfig);
      const request = new sql.Request();
      request.input('station', sql.NVarChar, station); // Cambiado a sql.NVarChar
      const result = await request.query('SELECT id_estacion FROM estaciones WHERE ubicacion = @station');
      if (result.recordset.length > 0) {
        return result.recordset[0].id_estacion;
      } else {
        throw new Error('No se encontraron datos para la estación proporcionada');
      }
    } catch (error) {
      console.error('Error al obtener la ubicación de la estación desde la base de datos:', error);
    } finally {
      await sql.close();
    }
  }


module.exports = { getApiData, getEstacionData }