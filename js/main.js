/* ============================================================
   main.js - PetPals (VistaUsuario.html)
   Lógica dinámica del catálogo de mascotas: búsqueda, filtros,
   orden, registro, edición, eliminación, indicadores y gráfico.
   ============================================================ */

// Variables globales de la página
let listaCategorias = [];
let graficoEspecies = null; // referencia al gráfico de Chart.js
let idEnEdicion = null; // guarda el id de la mascota que se está editando

// Elementos del DOM que se usan varias veces
const contenedorTarjetas = document.querySelector(".contenedor-tarjetas");
const inputBuscar = document.getElementById("buscador-mascota");
const selectFiltroEspecie = document.getElementById("filtro-especie");
const selectFiltroEstado = document.getElementById("filtro-estado");
const selectOrden = document.getElementById("orden-mascotas");
const formularioMascota = document.getElementById("formulario-mascota");
const btnRestablecer = document.getElementById("btn-restablecer");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");

const indicadores = {
  total: document.getElementById("ind-total"),
  saludables: document.getElementById("ind-saludables"),
  urgentes: document.getElementById("ind-urgentes"),
  promedioEdad: document.getElementById("ind-promedio-edad"),
  promedioCosto: document.getElementById("ind-promedio-costo"),
};

// ------------------------------------------------------------
// INICIO: se ejecuta cuando el HTML ya está listo
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {
  if (!contenedorTarjetas) return; // por si el script se carga en otra página

  mostrarCargando(true);
  const cargaOk = await cargarDatosIniciales();
  mostrarCargando(false);

  if (!cargaOk) {
    contenedorTarjetas.innerHTML =
      '<p class="sin-resultados"><i class="fa-solid fa-triangle-exclamation"></i> No se pudieron cargar los datos. Verifique su conexión e intente de nuevo.</p>';
    return;
  }

  listaCategorias = obtenerCategorias();
  llenarSelectCategorias(selectFiltroEspecie, listaCategorias, true);
  llenarSelectCategorias(document.getElementById("mascota-especieId"), listaCategorias, false);

  aplicarFiltrosYRenderizar();
  inicializarGrafico();

  registrarEventos();
});

function mostrarCargando(mostrar) {
  const aviso = document.getElementById("aviso-carga");
  if (!aviso) return;
  aviso.style.display = mostrar ? "block" : "none";
}

// ------------------------------------------------------------
// FILTRO + BÚSQUEDA + ORDEN (trabajan juntos sobre el arreglo)
// ------------------------------------------------------------
function aplicarFiltrosYRenderizar() {
  let mascotas = obtenerMascotas();

  const texto = inputBuscar ? inputBuscar.value.trim().toLowerCase() : "";
  const especieSeleccionada = selectFiltroEspecie ? selectFiltroEspecie.value : "todas";
  const estadoSeleccionado = selectFiltroEstado ? selectFiltroEstado.value : "todos";
  const orden = selectOrden ? selectOrden.value : "";

  // Búsqueda en tiempo real sobre nombre, raza y dueño
  if (texto !== "") {
    mascotas = mascotas.filter(function (m) {
      return (
        m.nombre.toLowerCase().includes(texto) ||
        m.raza.toLowerCase().includes(texto) ||
        m.dueño.toLowerCase().includes(texto)
      );
    });
  }

  // Filtro por especie
  if (especieSeleccionada && especieSeleccionada !== "todas") {
    mascotas = mascotas.filter(function (m) {
      return String(m.especieId) === String(especieSeleccionada);
    });
  }

  // Filtro por estado de salud
  if (estadoSeleccionado && estadoSeleccionado !== "todos") {
    mascotas = mascotas.filter(function (m) {
      return m.estado === estadoSeleccionado;
    });
  }

  // Ordenamiento
  if (orden === "nombre-asc") {
    mascotas.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  } else if (orden === "nombre-desc") {
    mascotas.sort(function (a, b) {
      return b.nombre.localeCompare(a.nombre);
    });
  } else if (orden === "edad-mayor") {
    mascotas.sort(function (a, b) {
      return b.edad - a.edad;
    });
  } else if (orden === "edad-menor") {
    mascotas.sort(function (a, b) {
      return a.edad - b.edad;
    });
  } else if (orden === "costo-mayor") {
    mascotas.sort(function (a, b) {
      return b.costoConsulta - a.costoConsulta;
    });
  } else if (orden === "costo-menor") {
    mascotas.sort(function (a, b) {
      return a.costoConsulta - b.costoConsulta;
    });
  }

  renderizarMascotas(mascotas, listaCategorias, contenedorTarjetas);
  renderizarIndicadores(obtenerMascotas(), indicadores); // los indicadores usan siempre el total real
  actualizarGrafico();
}

// ------------------------------------------------------------
// EVENTOS
// ------------------------------------------------------------
function registrarEventos() {
  // Búsqueda en tiempo real (evento input)
  if (inputBuscar) {
    inputBuscar.addEventListener("input", aplicarFiltrosYRenderizar);
  }

  // Filtros y orden (evento change)
  if (selectFiltroEspecie) selectFiltroEspecie.addEventListener("change", aplicarFiltrosYRenderizar);
  if (selectFiltroEstado) selectFiltroEstado.addEventListener("change", aplicarFiltrosYRenderizar);
  if (selectOrden) selectOrden.addEventListener("change", aplicarFiltrosYRenderizar);

  // Envío del formulario de registro / edición (evento submit)
  if (formularioMascota) {
    formularioMascota.addEventListener("submit", manejarEnvioFormulario);
  }

  // Botón para cancelar una edición en curso
  if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener("click", cancelarEdicion);
  }

  // Botón para restablecer los datos originales
  if (btnRestablecer) {
    btnRestablecer.addEventListener("click", manejarRestablecerDatos);
  }

  // Evento delegado: como las tarjetas se crean dinámicamente,
  // el "click" se escucha en el contenedor padre.
  if (contenedorTarjetas) {
    contenedorTarjetas.addEventListener("click", function (evento) {
      const boton = evento.target.closest("button");
      if (!boton) return;

      const id = Number(boton.getAttribute("data-id"));

      if (boton.classList.contains("btn-detalle")) {
        mostrarDetalleMascota(id);
      } else if (boton.classList.contains("btn-editar")) {
        cargarMascotaEnFormulario(id);
      } else if (boton.classList.contains("btn-eliminar")) {
        eliminarMascota(id);
      }
    });

    // Efecto simple al pasar el mouse sobre una tarjeta
    contenedorTarjetas.addEventListener("mouseover", function (evento) {
      const tarjeta = evento.target.closest(".tarjeta");
      if (tarjeta) tarjeta.classList.add("tarjeta-resaltada");
    });
    contenedorTarjetas.addEventListener("mouseout", function (evento) {
      const tarjeta = evento.target.closest(".tarjeta");
      if (tarjeta) tarjeta.classList.remove("tarjeta-resaltada");
    });
  }
}

// ------------------------------------------------------------
// DETALLE (SweetAlert2 con contenido HTML)
// ------------------------------------------------------------
function mostrarDetalleMascota(id) {
  const mascota = obtenerMascotas().find(function (m) {
    return m.id === id;
  });

  if (!mascota) {
    Swal.fire("Registro no encontrado", "La mascota seleccionada ya no existe.", "warning");
    return;
  }

  const citasMascota = obtenerCitas().filter(function (c) {
    return c.mascotaId === id;
  });

  let citasHtml = "<p>Sin citas registradas.</p>";
  if (citasMascota.length > 0) {
    citasHtml = "<ul style='text-align:left;'>";
    citasMascota.slice(0, 5).forEach(function (c) {
      citasHtml += "<li>" + c.fecha + " - " + c.hora + " - " + c.motivo + " (" + c.estado + ")</li>";
    });
    citasHtml += "</ul>";
  }

  const especie = nombreEspecie(mascota.especieId, listaCategorias);

  Swal.fire({
    title: mascota.nombre,
    html:
      "<p><strong>Especie:</strong> " + especie + "</p>" +
      "<p><strong>Raza:</strong> " + mascota.raza + "</p>" +
      "<p><strong>Edad:</strong> " + mascota.edad + " años</p>" +
      "<p><strong>Dueño:</strong> " + mascota.dueño + "</p>" +
      "<p><strong>Veterinario asignado:</strong> " + mascota.veterinarioAsignado + "</p>" +
      "<p><strong>Costo de consulta:</strong> $" + mascota.costoConsulta + "</p>" +
      "<p><strong>Notas:</strong> " + mascota.notas + "</p>" +
      "<hr><p><strong>Últimas citas:</strong></p>" + citasHtml,
    imageUrl: mascota.imagen,
    imageWidth: 80,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#2e7d32",
  });
}

// ------------------------------------------------------------
// REGISTRO Y EDICIÓN
// ------------------------------------------------------------
function manejarEnvioFormulario(evento) {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById("mascota-nombre").value.trim(),
    especieId: Number(document.getElementById("mascota-especieId").value),
    raza: document.getElementById("mascota-raza").value.trim(),
    edad: document.getElementById("mascota-edad").value,
    dueño: document.getElementById("mascota-dueño").value.trim(),
    estado: document.getElementById("mascota-estado").value,
    ultimaVisita: document.getElementById("mascota-fecha").value,
    costoConsulta: document.getElementById("mascota-costo").value,
  };

  const errores = validarFormularioMascota(datos);
  if (errores.length > 0) {
    Swal.fire("Formulario incompleto", errores.join("<br>"), "error");
    return;
  }

  let mascotas = obtenerMascotas();

  if (idEnEdicion === null) {
    // Registro de un nuevo elemento
    const nuevoId = mascotas.length > 0 ? Math.max(...mascotas.map(function (m) { return m.id; })) + 1 : 1;

    const nuevaMascota = {
      id: nuevoId,
      nombre: datos.nombre,
      especieId: datos.especieId,
      raza: datos.raza,
      edad: Number(datos.edad),
      dueño: datos.dueño,
      estado: datos.estado,
      ultimaVisita: datos.ultimaVisita,
      costoConsulta: Number(datos.costoConsulta),
      imagen: obtenerImagenPorEspecie(datos.especieId),
      veterinarioAsignado: "Por asignar",
      notas: "Registro creado por el dueño.",
    };

    mascotas.push(nuevaMascota);
    guardarMascotas(mascotas);
    Toastify({ text: "Mascota registrada correctamente", duration: 3000, backgroundColor: "#2e7d32" }).showToast();
  } else {
    // Modificación de un registro existente
    mascotas = mascotas.map(function (m) {
      if (m.id === idEnEdicion) {
        return Object.assign({}, m, {
          nombre: datos.nombre,
          especieId: datos.especieId,
          raza: datos.raza,
          edad: Number(datos.edad),
          dueño: datos.dueño,
          estado: datos.estado,
          ultimaVisita: datos.ultimaVisita,
          costoConsulta: Number(datos.costoConsulta),
          imagen: obtenerImagenPorEspecie(datos.especieId),
        });
      }
      return m;
    });

    guardarMascotas(mascotas);
    Toastify({ text: "Mascota actualizada correctamente", duration: 3000, backgroundColor: "#2e7d32" }).showToast();
  }

  formularioMascota.reset();
  idEnEdicion = null;
  btnCancelarEdicion.style.display = "none";
  aplicarFiltrosYRenderizar();
}

function obtenerImagenPorEspecie(especieId) {
  const categoria = listaCategorias.find(function (c) {
    return c.id === especieId;
  });
  return categoria ? categoria.imagen : "assets/img/especies/otro.svg";
}

function cargarMascotaEnFormulario(id) {
  const mascota = obtenerMascotas().find(function (m) {
    return m.id === id;
  });
  if (!mascota) return;

  document.getElementById("mascota-nombre").value = mascota.nombre;
  document.getElementById("mascota-especieId").value = mascota.especieId;
  document.getElementById("mascota-raza").value = mascota.raza;
  document.getElementById("mascota-edad").value = mascota.edad;
  document.getElementById("mascota-dueño").value = mascota.dueño;
  document.getElementById("mascota-estado").value = mascota.estado;
  document.getElementById("mascota-fecha").value = mascota.ultimaVisita;
  document.getElementById("mascota-costo").value = mascota.costoConsulta;

  idEnEdicion = id;
  btnCancelarEdicion.style.display = "inline-block";
  formularioMascota.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicion() {
  formularioMascota.reset();
  idEnEdicion = null;
  btnCancelarEdicion.style.display = "none";
}

// ------------------------------------------------------------
// ELIMINACIÓN (con confirmación de SweetAlert2)
// ------------------------------------------------------------
function eliminarMascota(id) {
  Swal.fire({
    title: "¿Eliminar este registro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#c62828",
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      const mascotas = obtenerMascotas().filter(function (m) {
        return m.id !== id;
      });
      guardarMascotas(mascotas);
      aplicarFiltrosYRenderizar();
      Toastify({ text: "Mascota eliminada", duration: 3000, backgroundColor: "#c62828" }).showToast();
    }
  });
}

// ------------------------------------------------------------
// RESTABLECER DATOS ORIGINALES
// ------------------------------------------------------------
function manejarRestablecerDatos() {
  Swal.fire({
    title: "¿Restablecer los datos originales?",
    text: "Se perderán los cambios realizados en este navegador.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, restablecer",
    cancelButtonText: "Cancelar",
  }).then(async function (resultado) {
    if (resultado.isConfirmed) {
      mostrarCargando(true);
      const ok = await restablecerDatosOriginales();
      mostrarCargando(false);
      if (ok) {
        listaCategorias = obtenerCategorias();
        aplicarFiltrosYRenderizar();
        Toastify({ text: "Datos restablecidos", duration: 3000, backgroundColor: "#2e7d32" }).showToast();
      } else {
        Swal.fire("Error", "No se pudieron restablecer los datos.", "error");
      }
    }
  });
}

// ------------------------------------------------------------
// GRÁFICO CHART.JS: mascotas por especie
// ------------------------------------------------------------
function inicializarGrafico() {
  const lienzo = document.getElementById("grafico-especies");
  if (!lienzo) return;

  const datos = datosParaGrafico();

  graficoEspecies = new Chart(lienzo, {
    type: "bar",
    data: {
      labels: datos.etiquetas,
      datasets: [
        {
          label: "Mascotas registradas",
          data: datos.valores,
          backgroundColor: "#2e7d32",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function actualizarGrafico() {
  if (!graficoEspecies) return;
  const datos = datosParaGrafico();
  graficoEspecies.data.labels = datos.etiquetas;
  graficoEspecies.data.datasets[0].data = datos.valores;
  graficoEspecies.update();
}

function datosParaGrafico() {
  const mascotas = obtenerMascotas();
  const etiquetas = listaCategorias.map(function (c) {
    return c.nombre;
  });
  const valores = listaCategorias.map(function (categoria) {
    return mascotas.filter(function (m) {
      return m.especieId === categoria.id;
    }).length;
  });
  return { etiquetas: etiquetas, valores: valores };
}
