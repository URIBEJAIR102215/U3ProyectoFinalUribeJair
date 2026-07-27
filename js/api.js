/* ============================================================
   api.js - PetPals
   Funciones para consumir APIs externas:
   1) countries.dev  -> lista de países para el registro
   2) Open-Meteo      -> clima actual para visitas a domicilio
   ============================================================ */

const URL_PAISES = "https://countries.dev/countries";

// Trae la lista completa de países (nombre + bandera)
async function obtenerPaises() {
  try {
    const respuesta = await fetch(URL_PAISES);

    if (!respuesta.ok) {
      throw new Error("La API de países respondió con error");
    }

    const datos = await respuesta.json();

    // La API puede devolver el arreglo directo o dentro de una
    // propiedad, así que se valida antes de usarlo.
    const listaPaises = Array.isArray(datos) ? datos : datos.data || [];
    return listaPaises;
  } catch (error) {
    console.error("Error al consultar la API de países:", error);
    return null;
  }
}

// Ciudades disponibles para consultar el clima (Open-Meteo)
const CIUDADES_CLIMA = [
  { nombre: "Santo Domingo", lat: -0.25, lon: -79.15 },
  { nombre: "Quevedo", lat: -1.03, lon: -79.46 },
  { nombre: "Quito", lat: -0.18, lon: -78.47 },
  { nombre: "Guayaquil", lat: -2.17, lon: -79.9 },
];

// Trae el clima actual para una latitud y longitud dadas
async function obtenerClimaActual(lat, lon) {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      lat +
      "&longitude=" +
      lon +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto";

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("La API de clima respondió con error");
    }

    const datos = await respuesta.json();

    if (!datos.current) {
      throw new Error("La respuesta del clima llegó vacía");
    }

    return datos.current;
  } catch (error) {
    console.error("Error al consultar el clima:", error);
    return null;
  }
}

// Traduce el código de clima de Open-Meteo a un texto sencillo
function textoClima(codigo) {
  if (codigo === 0) return "Cielo despejado";
  if (codigo <= 3) return "Parcialmente nublado";
  if (codigo <= 48) return "Neblina";
  if (codigo <= 67) return "Lluvia";
  if (codigo <= 77) return "Nieve";
  if (codigo <= 82) return "Chubascos";
  if (codigo <= 99) return "Tormenta";
  return "Sin datos";
}
