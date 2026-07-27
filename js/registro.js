/* ============================================================
   registro.js - PetPals (RegistroUribe.html)
   Lógica del formulario de registro de usuario, incluyendo el
   selector de nacionalidad conectado a la API de países.
   ============================================================ */

let listaPaises = [];
let paisSeleccionado = null;

const formularioRegistro = document.getElementById("formulario-registro");
const inputBuscarPais = document.getElementById("buscar-pais");
const listaPaisesEl = document.getElementById("lista-paises");
const inputNacionalidad = document.getElementById("nacionalidad-valor");
const avisoPais = document.getElementById("aviso-pais");

document.addEventListener("DOMContentLoaded", async function () {
  if (!formularioRegistro) return; // este script solo aplica a la página de registro

  await inicializarSelectorPaises();

  formularioRegistro.addEventListener("submit", manejarRegistroUsuario);

  if (inputBuscarPais) {
    inputBuscarPais.addEventListener("input", function () {
      filtrarPaises(inputBuscarPais.value);
    });
    // Muestra la lista completa al hacer clic en el campo
    inputBuscarPais.addEventListener("click", function () {
      listaPaisesEl.style.display = "block";
    });
  }

  // Cierra la lista desplegable si el usuario hace clic afuera
  document.addEventListener("click", function (evento) {
    if (!evento.target.closest(".selector-pais")) {
      listaPaisesEl.style.display = "none";
    }
  });
});

async function inicializarSelectorPaises() {
  if (avisoPais) avisoPais.textContent = "Cargando países...";

  const paises = await obtenerPaises();

  if (!paises || paises.length === 0) {
    if (avisoPais) {
      avisoPais.textContent = "No se pudo cargar la lista de países. Intente recargar la página.";
    }
    return;
  }

  listaPaises = paises;
  if (avisoPais) avisoPais.textContent = "";
  renderizarListaPaises(listaPaises);
}

function renderizarListaPaises(paises) {
  if (!listaPaisesEl) return;

  if (paises.length === 0) {
    listaPaisesEl.innerHTML = '<li class="sin-resultado-pais">Sin coincidencias</li>';
    return;
  }

  let html = "";
  paises.slice(0, 30).forEach(function (pais) {
    const nombre = pais.name && pais.name.common ? pais.name.common : pais.nombre || "Desconocido";
    const bandera = pais.flags && pais.flags.png ? pais.flags.png : pais.bandera || "";
    html +=
      '<li class="opcion-pais" data-nombre="' + nombre + '">' +
      (bandera ? '<img src="' + bandera + '" alt="Bandera de ' + nombre + '">' : "") +
      "<span>" + nombre + "</span>" +
      "</li>";
  });
  listaPaisesEl.innerHTML = html;

  // Evento delegado para seleccionar un país de la lista
  listaPaisesEl.querySelectorAll(".opcion-pais").forEach(function (item) {
    item.addEventListener("click", function () {
      const nombre = item.getAttribute("data-nombre");
      paisSeleccionado = nombre;
      inputBuscarPais.value = nombre;
      inputNacionalidad.value = nombre;
      listaPaisesEl.style.display = "none";
    });
  });
}

function filtrarPaises(texto) {
  const textoBusqueda = texto.trim().toLowerCase();
  listaPaisesEl.style.display = "block";

  if (textoBusqueda === "") {
    renderizarListaPaises(listaPaises);
    return;
  }

  const coincidencias = listaPaises.filter(function (pais) {
    const nombre = pais.name && pais.name.common ? pais.name.common : pais.nombre || "";
    return nombre.toLowerCase().includes(textoBusqueda);
  });

  renderizarListaPaises(coincidencias);
}

function manejarRegistroUsuario(evento) {
  evento.preventDefault();

  const datos = {
    nombres: document.getElementById("reg-nombres").value.trim(),
    apellidos: document.getElementById("reg-apellidos").value.trim(),
    correo: document.getElementById("reg-correo").value.trim(),
    password: document.getElementById("reg-password").value,
    confirmarPassword: document.getElementById("reg-confirmar-password").value,
    telefono: document.getElementById("reg-telefono").value.trim(),
    nacionalidad: inputNacionalidad.value,
    terminos: document.getElementById("reg-terminos").checked,
  };

  const errores = validarFormularioUsuario(datos);
  if (errores.length > 0) {
    Swal.fire("Revise el formulario", errores.join("<br>"), "error");
    return;
  }

  const usuarios = obtenerUsuarios();

  // Evita correos duplicados
  const yaExiste = usuarios.some(function (u) {
    return u.correo.toLowerCase() === datos.correo.toLowerCase();
  });
  if (yaExiste) {
    Swal.fire("Correo ya registrado", "Ya existe una cuenta con ese correo electrónico.", "warning");
    return;
  }

  const nuevoUsuario = {
    id: usuarios.length > 0 ? Math.max(...usuarios.map(function (u) { return u.id; })) + 1 : 1,
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    correo: datos.correo,
    telefono: datos.telefono,
    nacionalidad: datos.nacionalidad,
    fechaRegistro: new Date().toISOString().slice(0, 10),
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  Toastify({ text: "Cuenta registrada correctamente", duration: 3000, backgroundColor: "#2e7d32" }).showToast();

  Swal.fire({
    title: "¡Registro exitoso!",
    html:
      "<p>Bienvenido/a <strong>" + datos.nombres + "</strong></p>" +
      "<p>Nacionalidad: " + datos.nacionalidad + "</p>",
    icon: "success",
    confirmButtonText: "Ir a mi panel",
    confirmButtonColor: "#2e7d32",
  }).then(function () {
    window.location.href = "VistaUsuario.html";
  });
}
