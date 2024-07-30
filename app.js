const express = require('express'); 
const path = require('path');
const { getEstacionData, getApiData } = require('./db');
const { getTimestampsForRange, fetchData, fahrenheitToCelsius, inchesToMillimeters} = require('./api');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { results: null, error: null });
});

app.post('/get-data', async (req, res) => {
  const { station, startDate, endDate } = req.body;

  try {
    // datos API y de estacion promesa a base de datos.
    const { name_api, api_secret_key, api_key } = await getApiData();
    const id_estacion = await getEstacionData(station);
    if (!id_estacion) {
      throw new Error('La estación seleccionada no es válida');
    }

    // timestamps para el rango de fechas
    const timestamps = getTimestampsForRange(startDate, endDate);
    const results = [];
    let totalET = 0;
    let totalCdd = 0;
    let totalHdd = 0;

    for (const { startTimestamp, endTimestamp } of timestamps) {
      const apiUrl = `https://api.weatherlink.com/v2/historic/${id_estacion}?api-key=${api_key}&start-timestamp=${startTimestamp}&end-timestamp=${endTimestamp}`;
      const headers = {
        [name_api]: api_secret_key
      };

      // datos de la API
      const data = await fetchData(apiUrl, headers);

      if (data) {
        // datos ET, CDD y HDD
        let etData = data.sensors?.flatMap(sensor => sensor.data.map(entry => entry.et)).filter(value => value !== null && !isNaN(value)) || [];
        let cddData = data.sensors?.flatMap(sensor => sensor.data.map(entry => entry.cdd)).filter(value => value !== null && !isNaN(value)) || [];
        let hddData = data.sensors?.flatMap(sensor => sensor.data.map(entry => entry.hdd)).filter(value => value !== null && !isNaN(value)) || [];
        let tempHiData = data.sensors?.flatMap(sensor => sensor.data.map(entry => entry.temp_hi)).filter(value => value !== null && !isNaN(value)) || [];
        let tempLoData = data.sensors?.flatMap(sensor => sensor.data.map(entry => entry.temp_lo)).filter(value => value !== null && !isNaN(value)) || [];

        const etSum = etData.reduce((sum, value) => sum + inchesToMillimeters(value), 0).toFixed(2);
        const cddSum = cddData.reduce((sum, value) => sum + value, 0).toFixed(2);
        const hddSum = hddData.reduce((sum, value) => sum + value, 0).toFixed(2);
        const tempHiMax = tempHiData.length > 0 ? Math.max(...tempHiData.map(fahrenheitToCelsius)).toFixed(2) : 'N/A';
        const tempLoMin = tempLoData.length > 0 ? Math.min(...tempLoData.map(fahrenheitToCelsius)).toFixed(2) : 'N/A';
        totalET += parseFloat(etSum);
        totalCdd += parseFloat(cddSum);
        totalHdd += parseFloat(hddSum);

        results.push({
          dateFormatted: new Date(endTimestamp * 1000).toLocaleDateString(), // para la tabla
          dateOriginal: endTimestamp, // original para el Excel
          etSum,
          cddSum,
          hddSum,
          tempHiMax,
          tempLoMin
        });
      }
    }

    const stationName = station === "NTC" ? "ESTACION NANTOCO" :
                        station === "VDC" ? "ESTACION VDC" : "ESTACION LTZ";
    res.render('index', { results, stationName, totalET: totalET.toFixed(2), totalCdd: totalCdd.toFixed(2), totalHdd: totalHdd.toFixed(2), error: null });
  } catch (error) {
    console.error('Error en la ejecución principal:', error);
    res.render('index', { results: null, totalET: null, totalCdd: null, totalHdd: null, error: 'Ocurrió un error al obtener los datos. Inténtalo de nuevo.' });
  }
});
  
  app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
  });

