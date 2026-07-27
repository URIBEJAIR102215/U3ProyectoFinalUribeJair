# PetPals - Plataforma de Gestión Veterinaria

## Descripción
PetPals es un sitio web desarrollado como proyecto integrador para la asignatura de
Fundamentos Web. Simula una plataforma de gestión para un centro veterinario, donde los
dueños de mascotas pueden registrar, editar, eliminar y consultar a sus mascotas, agendar
citas y consultar el clima antes de una visita a domicilio, y el personal veterinario puede
revisar la agenda del día y buscar pacientes en tiempo real.

El proyecto evolucionó durante los tres parciales de la materia:
1. **Primer parcial:** estructura HTML semántica (header, nav, main, section, article,
   aside, footer, formularios con label, tablas con encabezados).
2. **Segundo parcial:** diseño responsivo mobile-first con Bootstrap 5 y CSS Grid/Flexbox.
3. **Tercer parcial:** incorporación de JavaScript, archivos JSON, `localStorage`,
   librerías externas y consumo de APIs para convertir el sitio en una aplicación dinámica.

## Objetivo
Integrar HTML semántico, diseño web responsivo, JavaScript, archivos JSON, almacenamiento
local, librerías y APIs externas, demostrando su funcionamiento mediante un catálogo de
mascotas totalmente dinámico.

## Funcionalidades principales
- Carga de datos desde archivos JSON y persistencia en `localStorage`.
- Catálogo de mascotas generado dinámicamente (tarjetas) con búsqueda en tiempo real,
  filtros por especie y estado, y ordenamiento por nombre, edad o costo de consulta.
- Registro, edición y eliminación de mascotas con validación de formularios.
- Confirmación de eliminación y de restablecimiento de datos mediante SweetAlert2.
- Notificaciones rápidas (Toastify) al guardar, actualizar o eliminar registros.
- Panel de indicadores calculado con `map()`, `filter()`, `reduce()`.
- Gráfico de mascotas por especie con Chart.js, actualizado tras cada operación.
- Formulario de registro de usuario con selector de nacionalidad conectado a una API de
  países (buscador + bandera + nombre).
- Widget de clima (Open-Meteo) en el panel del veterinario para decidir visitas a domicilio.
- Agenda del veterinario y búsqueda de pacientes generadas dinámicamente desde JSON,
  relacionando `citas.json` y `mascotas.json` mediante `mascotaId`.
- Manejo de errores con `try/catch` y validación de `response.ok` en todas las llamadas
  `fetch`.

## Tecnologías utilizadas
- HTML5 semántico
- CSS3 (Flexbox, Grid, media queries, mobile-first)
- JavaScript (ES6, `fetch`, `async/await`, manipulación del DOM, eventos)
- Bootstrap 5.3 (Navbar, Carousel, Badges, Tablas responsivas, Botones)
- Font Awesome 6.5 (iconografía)

## Librerías JavaScript integradas
| Librería | Uso en el proyecto |
|---|---|
| **SweetAlert2** | Confirmar eliminaciones, confirmar restablecimiento de datos, mostrar el detalle de cada mascota y confirmar el registro de usuario. |
| **Toastify** | Notificaciones breves al registrar, editar o eliminar una mascota, y al restablecer los datos. |
| **Chart.js** | Gráfico de barras "Mascotas por especie" en el panel del dueño, actualizado en cada operación CRUD. |

## APIs consumidas
| API | Uso |
|---|---|
| `https://countries.dev/countries` | Selector de nacionalidad en el formulario de registro (buscador con bandera y nombre del país). |
| Open-Meteo (`api.open-meteo.com`) | Clima actual (temperatura, humedad, viento, condición) para Santo Domingo, Quevedo, Quito y Guayaquil, usado en el panel del veterinario para las visitas a domicilio. |

## Estructura de carpetas
```
PetPals-Final/
│
├── index.html                (redirige a la misma vista que LoginUribe.html)
├── LoginUribe.html
├── RegistroUribe.html
├── VistaUsuario.html
├── VistaVeterinario.html
├── ContactoUribe.html
├── README.md
│
├── css/
│   ├── general.css           (estilos compartidos)
│   ├── componentes.css       (estilos de los componentes dinámicos)
│   ├── Login.css
│   ├── Registro.css
│   ├── Usuario.css
│   ├── Veterinario.css
│   └── Contacto.css
│
├── js/
│   ├── storage.js            (carga inicial y persistencia en localStorage)
│   ├── api.js                (consumo de la API de países y de clima)
│   ├── validaciones.js       (validación de formularios)
│   ├── componentes.js        (funciones que generan HTML dinámico)
│   ├── main.js                (lógica del catálogo de mascotas - VistaUsuario)
│   ├── veterinario.js        (agenda, búsqueda de pacientes y clima - VistaVeterinario)
│   └── registro.js           (registro de usuario y selector de país)
│
├── json/
│   ├── mascotas.json         (25 registros - archivo principal)
│   ├── categorias.json       (5 registros - especies)
│   └── citas.json            (70 registros - relacionado mediante mascotaId)
│
├── img/                      (imágenes originales del sitio)
└── assets/img/especies/      (íconos SVG usados como "imagen" en mascotas.json)
```

## Relación entre los archivos JSON
- `mascotas.json` incluye la propiedad `especieId`, que se relaciona con el `id` de
  `categorias.json` para mostrar el nombre e ícono de la especie.
- `citas.json` incluye la propiedad `mascotaId`, que se relaciona con el `id` de
  `mascotas.json` para mostrar el nombre y el dueño de cada cita.
- Estas relaciones se resuelven en JavaScript usando `find()`, `filter()` y `map()`
  después de cargar los archivos con `fetch`, tal como lo requiere el proyecto.

## Instrucciones para ejecutar el proyecto
1. Clonar o descargar el repositorio.
2. Abrir la carpeta con Live Server (o cualquier servidor local), ya que los archivos
   JSON se cargan mediante `fetch` y no funcionan al abrir el HTML directamente con
   doble clic.
3. Iniciar en `index.html` o `LoginUribe.html` y navegar usando el menú superior.
4. Ingresar como "Dueño" para ver el catálogo dinámico de mascotas, o como "Veterinario"
   para ver la agenda y el clima.
5. Para revisar el diseño responsive, usar las herramientas de desarrollador del
   navegador (F12 → modo de diseño adaptable) y probar resoluciones de 375px, 768px y
   1366px.

## Autor
Jair Uribe — Universidad de las Fuerzas Armadas ESPE
