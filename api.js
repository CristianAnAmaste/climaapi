const axios = require('axios');

  
  // Función para obtener datos de la API
  async function fetchData(apiUrl, headers) {
    try {
      const response = await axios.get(apiUrl, { headers });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de la API:', error);
      return null;
    }
  }
 
/*function getTimestampsForDate(date) {
  const localDate = new Date(date);
  const startTimestamp = Math.round(new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0).getTime() / 1000);
  const endTimestamp = Math.round(new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59, 999).getTime() / 1000);
  return { startTimestamp, endTimestamp };
}*/

function getTimestampsForRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timestamps = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    // se tiene que trabajar con GMT-4
    const startDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    // se tiene que trabajar en GMT-4
    const endDate = new Date(date.getTime() + (28 * 60 * 60 * 1000) - 1);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    timestamps.push({ startTimestamp, endTimestamp });
  }

  return timestamps;
}

function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

function fahrenheitToCelsiusHddCdd(fahrenheit) {
  return (fahrenheit) * 5 / 9;
}

function inchesToMillimeters(inches) {
  return inches * 25.4;
}

  
  module.exports = {
    getTimestampsForRange,
    fetchData,
    fahrenheitToCelsius,
    inchesToMillimeters,
    fahrenheitToCelsiusHddCdd
  };

  