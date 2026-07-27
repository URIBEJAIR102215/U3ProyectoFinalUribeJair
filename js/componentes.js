/* ============================================================
   componentes.js - PetPals
   Funciones encargadas de generar el HTML dinámico:
   tarjetas de mascotas, indicadores, opciones de select, etc.
   ============================================================ */

// Busca el nombre de la especie a partir del especieId (relación
// entre mascotas.json y categorias.json)
function nombreEspecie(especieId, categorias) {
  const categoria = categorias.find(function (c) {
    return c.id === especieId;
  });
  return categoria ? categoria.nombre : "Sin especie";
}

function iconoEspecie(especieId, categorias) {
  const categoria = categorias.find(function (c) {
    return c.id === especieId;
  });
  return categoria ? categoria.icono : "fa-solid fa-paw";
}

// Devuelve la clase del badge de bootstrap según el estado
function claseBadgeEstado(estado) {
  if (estado === "Saludable") return "bg-success";
  if (estado === "Vacunas Pendientes") return "bg-warning text-dark";
  if (estado === "En revisión") return "bg-info text-dark";
  if (estado === "Urgente") return "bg-danger";
  if (estado === "Tratamiento") return "bg-secondary";
  return "bg-light text-dark";
}

// Genera el HTML de una sola tarjeta de mascota
function crearTarjetaMascota(mascota, categorias) {
  const especie = nombreEspecie(mascota.especieId, categorias);
  const icono = iconoEspecie(mascota.especieId, categorias);
  const claseBadge = claseBadgeEstado(mascota.estado);

  return (
    '<article class="tarjeta" data-id="' + mascota.id + '">' +
      '<img src="' + mascota.imagen + '" alt="Icono de ' + especie + '" class="icono-especie">' +
      '<h3><i class="' + icono + '"></i> ' + mascota.nombre + '</h3>' +
      '<table>' +
        '<tbody>' +
          '<tr><td><strong>Especie:</strong></td><td>' + especie + '</td></tr>' +
          '<tr><td><strong>Raza:</strong></td><td>' + mascota.raza + '</td></tr>' +
          '<tr><td><strong>Edad:</strong></td><td>' + mascota.edad + ' años</td></tr>' +
          '<tr><td><strong>Dueño:</strong></td><td>' + mascota.dueño + '</td></tr>' +
          '<tr><td><strong>Consulta:</strong></td><td>$' + mascota.costoConsulta + '</td></tr>' +
          '<tr><td><strong>Estado:</strong></td><td><span class="badge ' + claseBadge + '">' + mascota.estado + '</span></td></tr>' +
        '</tbody>' +
      '</table>' +
      '<div class="acciones-tarjeta mt-sm">' +
        '<button type="button" class="btn-agendar btn-detalle" data-id="' + mascota.id + '">' +
          '<i class="fa-solid fa-eye"></i> Detalle' +
        '</button>' +
        '<button type="button" class="btn-agendar secondary btn-editar" data-id="' + mascota.id + '">' +
          '<i class="fa-solid fa-pen"></i> Editar' +
        '</button>' +
        '<button type="button" class="btn-agendar peligro btn-eliminar" data-id="' + mascota.id + '">' +
          '<i class="fa-solid fa-trash"></i> Eliminar' +
        '</button>' +
      '</div>' +
    '</article>'
  );
}

// Pinta la lista completa de mascotas dentro del contenedor
function renderizarMascotas(listaMascotas, categorias, contenedor) {
  if (listaMascotas.length === 0) {
    contenedor.innerHTML = '<p class="sin-resultados"><i class="fa-solid fa-circle-info"></i> No se encontraron mascotas con esos criterios.</p>';
    return;
  }

  let html = "";
  listaMascotas.forEach(function (mascota) {
    html += crearTarjetaMascota(mascota, categorias);
  });
  contenedor.innerHTML = html;
}

// Llena un elemento <select> con las categorías/especies
function llenarSelectCategorias(select, categorias, incluirTodas) {
  let html = "";
  if (incluirTodas) {
    html += '<option value="todas">Todas las especies</option>';
  }
  categorias.forEach(function (categoria) {
    html += '<option value="' + categoria.id + '">' + categoria.nombre + '</option>';
  });
  select.innerHTML = html;
}

// Calcula y muestra los indicadores del panel de resumen
function renderizarIndicadores(listaMascotas, contenedores) {
  const total = listaMascotas.length;

  const totalSaludables = listaMascotas.filter(function (m) {
    return m.estado === "Saludable";
  }).length;

  const totalUrgentes = listaMascotas.filter(function (m) {
    return m.estado === "Urgente";
  }).length;

  let promedioEdad = 0;
  if (total > 0) {
    const sumaEdades = listaMascotas.reduce(function (acumulado, m) {
      return acumulado + Number(m.edad);
    }, 0);
    promedioEdad = (sumaEdades / total).toFixed(1);
  }

  let promedioCosto = 0;
  if (total > 0) {
    const sumaCostos = listaMascotas.reduce(function (acumulado, m) {
      return acumulado + Number(m.costoConsulta);
    }, 0);
    promedioCosto = (sumaCostos / total).toFixed(2);
  }

  contenedores.total.textContent = total;
  contenedores.saludables.textContent = totalSaludables;
  contenedores.urgentes.textContent = totalUrgentes;
  contenedores.promedioEdad.textContent = promedioEdad;
  contenedores.promedioCosto.textContent = "$" + promedioCosto;
}
