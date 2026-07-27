/* ============================================================
   validaciones.js - PetPals
   Funciones básicas de validación usadas en los formularios
   de mascotas y de registro de usuario.
   ============================================================ */

function campoVacio(valor) {
  return valor === null || valor === undefined || valor.toString().trim() === "";
}

function esCorreoValido(correo) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(correo);
}

function esNumeroValido(valor) {
  return !isNaN(valor) && Number(valor) >= 0;
}

// Valida los datos del formulario de mascotas (registro/edición)
function validarFormularioMascota(datos) {
  const errores = [];

  if (campoVacio(datos.nombre)) errores.push("El nombre de la mascota es obligatorio.");
  if (campoVacio(datos.especieId)) errores.push("Debe seleccionar una especie.");
  if (campoVacio(datos.raza)) errores.push("La raza es obligatoria.");
  if (campoVacio(datos.edad) || !esNumeroValido(datos.edad)) errores.push("La edad debe ser un número válido.");
  if (campoVacio(datos.dueño)) errores.push("El nombre del dueño es obligatorio.");
  if (campoVacio(datos.estado)) errores.push("Debe seleccionar un estado de salud.");
  if (campoVacio(datos.ultimaVisita)) errores.push("La fecha de la última visita es obligatoria.");
  if (campoVacio(datos.costoConsulta) || !esNumeroValido(datos.costoConsulta)) {
    errores.push("El costo de consulta debe ser un número válido.");
  }

  return errores;
}

// Valida los datos del formulario de registro de usuario
function validarFormularioUsuario(datos) {
  const errores = [];

  if (campoVacio(datos.nombres)) errores.push("Los nombres son obligatorios.");
  if (campoVacio(datos.apellidos)) errores.push("Los apellidos son obligatorios.");
  if (campoVacio(datos.correo) || !esCorreoValido(datos.correo)) {
    errores.push("Ingrese un correo electrónico válido.");
  }
  if (campoVacio(datos.password) || datos.password.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if (datos.password !== datos.confirmarPassword) {
    errores.push("Las contraseñas no coinciden.");
  }
  if (campoVacio(datos.telefono)) errores.push("El teléfono es obligatorio.");
  if (campoVacio(datos.nacionalidad)) errores.push("Debe seleccionar su nacionalidad.");
  if (!datos.terminos) errores.push("Debe aceptar los términos y condiciones.");

  return errores;
}
