# Turnos Saavedra · prototipo funcional

Prototipo funcional (HTML, CSS y JavaScript) de un sistema para gestionar **turnos, clientes y pagos** de un autolavado de barrio en Bogotá D.C.

> Todos los datos que aparecen al abrir el prototipo son **ficticios**. Nada se envía a ningún servidor: los datos se guardan solo en el navegador de quien lo prueba.

## Cómo probarlo

Abra el enlace de GitHub Pages del repositorio desde un celular o un computador con navegador actualizado. No hay que instalar nada.

Para volver a empezar con los datos de ejemplo, use el enlace **"Restablecer datos de prueba"** al final de la pantalla *Agenda*.

## Pantallas

| Pantalla | Archivo | Qué permite |
|---|---|---|
| Agenda del día | `index.html` | Ver los turnos por día, iniciar, terminar o cancelar un servicio y ver quién debe. |
| Nuevo turno | `nuevo.html` | Agendar un servicio eligiendo cliente, servicio, fecha y hora. **No permite dos turnos a la misma hora.** |
| Clientes | `clientes.html` | Registrar clientes (con autorización de tratamiento de datos, Ley 1581 de 2012), buscarlos y agendarles un turno. |
| Pagos | `pagos.html` | Cobrar en efectivo o transferencia, con abonos parciales. No incluye pasarela de pago. |
| Ingresos | `ingresos.html` | Resumen de lo cobrado por día, semana y mes, con reparto por medio de pago. |

## Requisitos de la Actividad 2 que cubre

- Agendar y consultar turnos **sin cruces de horario**.
- Registrar clientes y servicios prestados.
- Resumen de ingresos por día, semana y mes.
- Consulta desde el celular (diseño para pantallas pequeñas).
- Funciona en celulares de gama media: solo se carga el CSS de Bootstrap y una fuente; el resto es código propio y ligero.

## Tecnología

HTML5, CSS3 y JavaScript (ES6). Interfaz con **Bootstrap 5.3.3** (CSS, desde CDN) y la fuente **Roboto** (Google Fonts). Datos en `localStorage`.

## Requisitos para usarlo

- Celular o computador con navegador actualizado (Chrome, Edge, Firefox o Safari).
- Conexión a internet para cargar Bootstrap y la fuente desde sus CDN.
- Pantalla a partir de 320 px de ancho.

## Estructura

```
index.html   nuevo.html   clientes.html   pagos.html   ingresos.html
css/style.css        estilos compartidos
js/app.js            datos (Store) y utilidades de pantalla (UI)
```

## Limitaciones

Es un prototipo: no hay usuarios ni contraseñas, no hay base de datos compartida entre dispositivos (cada persona ve sus propios datos) y los pagos electrónicos no están implementados.
