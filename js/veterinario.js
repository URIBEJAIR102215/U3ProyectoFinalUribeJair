/* ============================================================
   veterinario.js - PetPals (VistaVeterinario.html)
   Agenda dinámica (JSON + localStorage), búsqueda de pacientes
   en tiempo real y widget de clima (API Open-Meteo) para las
   visitas a domicilio.
   ============================================================ */

const cuerpoAgenda = document.getElementById("cuerpo-agenda");
const cuerpoPacientes = document.getElementById("cuerpo-pacientes");
const inputBuscarPaciente = document.getElementById("buscar-paciente");
const formBuscarPaciente = document.getElementById("form-buscar-paciente");
const selectCiudadClima = document.getElementById("clima-ciudad");
const resultadoClima = document.getElementById("clima-resultado");

document.addEventListener("DOMContentLoaded", async function () {
  if (!cuerpoAgenda) return; // este script solo aplica al panel del veterinario

  await cargarDatosIniciales();
  renderizarAgenda();
  renderizarPacientes(obtenerMascotas());
  inicializarClima();
  registrarEventosVeterinario();
});

function registrarEventosVeterinario() {
  if (formBuscarPaciente) {
    // Se evita que el formulario recargue la página
    formBuscarPaciente.addEventListener("submit", function (evento) {
      evento.preventDefault();
      buscarPacientes();
    });
  }

  if (inputBuscarPaciente) {
    inputBuscarPaciente.addEventListener("input", buscarPacientes);
  }

  if (selectCiudadClima) {
    selectCiudadClima.addEventListener("change", consultarClima);
  }
}

// ------------------------------------------------------------
// AGENDA (une citas.json con mascotas.json mediante mascotaId)
// ------------------------------------------------------------
function renderizarAgenda() {
  const citas = obtenerCitas();
  const mascotas = obtenerMascotas();

  // Se muestran las próximas 8 citas ordenadas por fecha
  const proximasCitas = citas
    .slice()
    .sort(function (a, b) {
      return a.fecha.localeCompare(b.fecha);
    })
    .slice(0, 8);

  if (proximasCitas.length === 0) {
    cuerpoAgenda.innerHTML = '<tr><td colspan="5">No hay citas registradas.</td></tr>';
    return;
  }

  let html = "";
  proximasCitas.forEach(function (cita) {
    const mascota = mascotas.find(function (m) {
      return m.id === cita.mascotaId;
    });
    const nombreMascota = mascota ? mascota.nombre : "Mascota eliminada";
    const dueno = mascota ? mascota.dueño : "-";

    html +=
      "<tr>" +
      "<td>" + cita.fecha + " " + cita.hora + "</td>" +
      "<td>" + nombreMascota + "</td>" +
      "<td>" + dueno + "</td>" +
      "<td>" + cita.motivo + "</td>" +
      "<td><span class='badge " + claseBadgeCita(cita.estado) + "'>" + cita.estado + "</span></td>" +
      "</tr>";
  });

  cuerpoAgenda.innerHTML = html;
}

function claseBadgeCita(estado) {
  if (estado === "Confirmada") return "bg-success";
  if (estado === "Pendiente") return "bg-warning text-dark";
  if (estado === "Urgente") return "bg-danger";
  if (estado === "Completada") return "bg-secondary";
  if (estado === "Cancelada") return "bg-dark";
  return "bg-light text-dark";
}

// ------------------------------------------------------------
// BÚSQUEDA DE PACIENTES EN TIEMPO REAL
// ------------------------------------------------------------
function buscarPacientes() {
  const texto = inputBuscarPaciente.value.trim().toLowerCase();
  const mascotas = obtenerMascotas();

  if (texto === "") {
    renderizarPacientes(mascotas);
    return;
  }

  const resultado = mascotas.filter(function (m) {
    return m.nombre.toLowerCase().includes(texto) || m.dueño.toLowerCase().includes(texto);
  });

  renderizarPacientes(resultado);
}

function renderizarPacientes(mascotas) {
  if (!cuerpoPacientes) return;

  if (mascotas.length === 0) {
    cuerpoPacientes.innerHTML = '<tr><td colspan="5">Sin coincidencias para esa búsqueda.</td></tr>';
    return;
  }

  const categorias = obtenerCategorias();

  let html = "";
  mascotas.forEach(function (m) {
    const especie = nombreEspecie(m.especieId, categorias);
    html +=
      "<tr>" +
      "<td>" + m.nombre + "</td>" +
      "<td>" + especie + " - " + m.raza + "</td>" +
      "<td>" + m.dueño + "</td>" +
      "<td>" + m.ultimaVisita + "</td>" +
      "<td><button type='button' class='btn btn-sm btn-outline-success btn-ver-paciente' data-id='" + m.id + "'>Ver expediente</button></td>" +
      "</tr>";
  });

  cuerpoPacientes.innerHTML = html;

  // Evento delegado para el botón "Ver expediente"
  cuerpoPacientes.querySelectorAll(".btn-ver-paciente").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const id = Number(boton.getAttribute("data-id"));
      mostrarExpedientePaciente(id);
    });
  });
}

function mostrarExpedientePaciente(id) {
  const mascota = obtenerMascotas().find(function (m) {
    return m.id === id;
  });
  if (!mascota) return;

  const categorias = obtenerCategorias();
  const especie = nombreEspecie(mascota.especieId, categorias);

  Swal.fire({
    title: mascota.nombre + " - Expediente",
    html:
      "<p><strong>Especie:</strong> " + especie + " (" + mascota.raza + ")</p>" +
      "<p><strong>Edad:</strong> " + mascota.edad + " años</p>" +
      "<p><strong>Dueño:</strong> " + mascota.dueño + "</p>" +
      "<p><strong>Estado:</strong> " + mascota.estado + "</p>" +
      "<p><strong>Veterinario asignado:</strong> " + mascota.veterinarioAsignado + "</p>" +
      "<p><strong>Última visita:</strong> " + mascota.ultimaVisita + "</p>" +
      "<p><strong>Notas:</strong> " + mascota.notas + "</p>",
    confirmButtonColor: "#2e7d32",
  });
}

// ------------------------------------------------------------
// CLIMA PARA VISITAS A DOMICILIO (Open-Meteo)
// ------------------------------------------------------------
function inicializarClima() {
  if (!selectCiudadClima) return;

  let html = "";
  CIUDADES_CLIMA.forEach(function (ciudad, indice) {
    html += "<option value='" + indice + "'>" + ciudad.nombre + "</option>";
  });
  selectCiudadClima.innerHTML = html;

  consultarClima(); // muestra el clima de la primera ciudad al cargar
}

async function consultarClima() {
  if (!resultadoClima) return;

  const indice = Number(selectCiudadClima.value);
  const ciudad = CIUDADES_CLIMA[indice];

  resultadoClima.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Consultando clima...</p>';

  const clima = await obtenerClimaActual(ciudad.lat, ciudad.lon);

  if (!clima) {
    resultadoClima.innerHTML = '<p class="sin-resultados"><i class="fa-solid fa-triangle-exclamation"></i> No se pudo obtener el clima en este momento.</p>';
    return;
  }

  resultadoClima.innerHTML =
    "<p><i class='fa-solid fa-location-dot'></i> <strong>" + ciudad.nombre + "</strong></p>" +
    "<p><i class='fa-solid fa-temperature-half'></i> Temperatura: " + clima.temperature_2m + " °C</p>" +
    "<p><i class='fa-solid fa-droplet'></i> Humedad: " + clima.relative_humidity_2m + " %</p>" +
    "<p><i class='fa-solid fa-wind'></i> Viento: " + clima.wind_speed_10m + " km/h</p>" +
    "<p><i class='fa-solid fa-cloud-sun'></i> Condición: " + textoClima(clima.weather_code) + "</p>";
}
