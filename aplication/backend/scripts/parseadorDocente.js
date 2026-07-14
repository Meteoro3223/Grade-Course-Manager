const fs = require("fs");
const pdfParse = require("pdf-parse");

// limpia saltos de linea, tabulaciones y espacios repetidos
function limpiarTexto(texto) {
  return texto
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .trim();
}

// extrae solo el bloque de evaluacion
function extraerBloqueEvaluacion(texto) {
  const inicio = texto.lastIndexOf("10. Evaluación");

  if (inicio === -1) {
    return "";
  }

  const desdeEvaluacion = texto.slice(inicio);
  const fin = desdeEvaluacion.indexOf("11. Porcentaje máximo de ausencia");

  if (fin !== -1) {
    return desdeEvaluacion.slice(0, fin).trim();
  }

  return desdeEvaluacion.trim();
}

// extrae las filas de la tabla de evaluacion
function extraerTablaEvaluacion(textoEvaluacion) {
  const lineas = textoEvaluacion
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  const indiceDescripcion = lineas.findIndex((linea) =>
    linea.toLowerCase().includes("descripción")
  );

  if (indiceDescripcion === -1) {
    return [];
  }

  const descripciones = [];
  const numeros = [];
  const lineasTabla = lineas.slice(indiceDescripcion + 1);

  // recorre la tabla hasta que acaba el bloque util
  for (const linea of lineasTabla) {
    if (linea.includes("Última actualización")) break;
    if (linea.includes("11. Porcentaje máximo")) break;

    if (linea.includes("GUIA DOCENTE")) continue;
    if (linea.includes("Peso (%)")) continue;
    if (linea.includes("Nº a")) continue;
    if (linea.includes("Descripción")) continue;

    const descripcion = linea.match(/^\(\d+\)\s*(.+)$/);
    // si la linea es una descripcion, la agrega al array y continua con la siguiente linea
    if (descripcion) {
      descripciones.push(descripcion[1].trim());
      continue;
    }

    if (/^\d{1,3}$/.test(linea)) {
      numeros.push(Number(linea));
    }
  }

  const cantidad = descripciones.length;

  if (cantidad === 0 || numeros.length < cantidad * 2) {
    return [];
  }

  const pesos = numeros.slice(0, cantidad);
  const actas = numeros.slice(cantidad, cantidad * 2);

  return descripciones.map((descripcion, index) => ({
    descripcion,
    actas: actas[index],
    peso: pesos[index],
  }));
}

// lee el pdf y devuelve la evaluacion parseada
async function parsearGuiaDocente(rutaPdf) {
  const buffer = fs.readFileSync(rutaPdf);
  const datosPdf = await pdfParse(buffer);

  const texto = limpiarTexto(datosPdf.text);
  const textoEvaluacion = extraerBloqueEvaluacion(texto);

  return extraerTablaEvaluacion(textoEvaluacion);
}

module.exports = parsearGuiaDocente;