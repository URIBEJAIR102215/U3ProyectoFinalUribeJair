/* ============================================================
   storage.js - PetPals
   Funciones encargadas de cargar los archivos JSON la primera
   vez y de guardar / leer los datos desde localStorage.
   ============================================================ */

// Claves que se usan dentro de localStorage
const CLAVE_MASCOTAS = "petpals_mascotas";
const CLAVE_CATEGORIAS = "petpals_categorias";
const CLAVE_CITAS = "petpals_citas";
const CLAVE_USUARIOS = "petpals_usuarios";

// Carga inicial: si no hay nada guardado en localStorage, se
// obtienen los datos desde los archivos JSON con fetch.
async function cargarDatosIniciales() {
  try {
    const yaExisteMascotas = localStorage.getItem(CLAVE_MASCOTAS);
    const yaExisteCategorias = localStorage.getItem(CLAVE_CATEGORIAS);
    const yaExisteCitas = localStorage.getItem(CLAVE_CITAS);

    if (yaExisteMascotas && yaExisteCategorias && yaExisteCitas) {
      // Ya existen datos guardados en el navegador, no se
      // vuelve a consultar los archivos JSON.
      return true;
    }

    // Se cargan los tres archivos JSON en paralelo
    const [resMascotas, resCategorias, resCitas] = await Promise.all([
      fetch("json/mascotas.json"),
      fetch("json/categorias.json"),
      fetch("json/citas.json"),
    ]);

    if (!resMascotas.ok || !resCategorias.ok || !resCitas.ok) {
      throw new Error("No se pudo leer alguno de los archivos JSON");
    }

    const mascotas = await resMascotas.json();
    const categorias = await resCategorias.json();
    const citas = await resCitas.json();

    localStorage.setItem(CLAVE_MASCOTAS, JSON.stringify(mascotas));
    localStorage.setItem(CLAVE_CATEGORIAS, JSON.stringify(categorias));
    localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));

    return true;
  } catch (error) {
    console.error("Error al cargar los datos iniciales:", error);
    return false;
  }
}

// Restablece los datos originales desde los archivos JSON,
// reemplazando lo que el usuario haya modificado.
async function restablecerDatosOriginales() {
  try {
    const [resMascotas, resCategorias, resCitas] = await Promise.all([
      fetch("json/mascotas.json"),
      fetch("json/categorias.json"),
      fetch("json/citas.json"),
    ]);

    if (!resMascotas.ok || !resCategorias.ok || !resCitas.ok) {
      throw new Error("Respuesta incorrecta al leer los JSON originales");
    }

    const mascotas = await resMascotas.json();
    const categorias = await resCategorias.json();
    const citas = await resCitas.json();

    localStorage.setItem(CLAVE_MASCOTAS, JSON.stringify(mascotas));
    localStorage.setItem(CLAVE_CATEGORIAS, JSON.stringify(categorias));
    localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));

    return true;
  } catch (error) {
    console.error("Error al restablecer los datos:", error);
    return false;
  }
}

// Funciones simples para leer cada colección desde localStorage
function obtenerMascotas() {
  const datos = localStorage.getItem(CLAVE_MASCOTAS);
  return datos ? JSON.parse(datos) : [];
}

function obtenerCategorias() {
  const datos = localStorage.getItem(CLAVE_CATEGORIAS);
  return datos ? JSON.parse(datos) : [];
}

function obtenerCitas() {
  const datos = localStorage.getItem(CLAVE_CITAS);
  return datos ? JSON.parse(datos) : [];
}

// Funciones para guardar cada colección en localStorage
function guardarMascotas(listaMascotas) {
  localStorage.setItem(CLAVE_MASCOTAS, JSON.stringify(listaMascotas));
}

function guardarCitas(listaCitas) {
  localStorage.setItem(CLAVE_CITAS, JSON.stringify(listaCitas));
}

// Usuarios registrados (formulario de registro)
function obtenerUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);
  return datos ? JSON.parse(datos) : [];
}

function guardarUsuarios(listaUsuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(listaUsuarios));
}
