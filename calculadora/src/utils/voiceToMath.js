/**
 * Utilidad para convertir texto en español a expresiones matemáticas
 */

// Mapeo de números en español a dígitos
const numerosMap = {
  'cero': '0',
  'uno': '1',
  'dos': '2',
  'tres': '3',
  'cuatro': '4',
  'cinco': '5',
  'seis': '6',
  'siete': '7',
  'ocho': '8',
  'nueve': '9',
  'diez': '10',
  'once': '11',
  'doce': '12',
  'trece': '13',
  'catorce': '14',
  'quince': '15',
  'dieciséis': '16',
  'dieciseis': '16',
  'diecisiete': '17',
  'dieciocho': '18',
  'diecinueve': '19',
  'veinte': '20',
  'veintiuno': '21',
  'veintidós': '22',
  'veintidos': '22',
  'veintitrés': '23',
  'veintitres': '23',
  'veinticuatro': '24',
  'veinticinco': '25',
  'veintiséis': '26',
  'veintiseis': '26',
  'veintisiete': '27',
  'veintiocho': '28',
  'veintinueve': '29',
  'treinta': '30',
  'cuarenta': '40',
  'cincuenta': '50',
  'sesenta': '60',
  'setenta': '70',
  'ochenta': '80',
  'noventa': '90',
  'cien': '100',
  'ciento': '100',
  'mil': '1000'
};

// Mapeo de operadores en español a símbolos
const operadoresMap = {
  'más': '+',
  'mas': '+',
  'menos': '-',
  'por': '*',
  'entre': '/',
  
};

// Mapeo de funciones y símbolos especiales
// Solo incluye lo que está disponible en los botones de la calculadora
const funcionesMap = {
  'paréntesis': '(',
  'parentesis': '(',
  'abre paréntesis': '(',
  'abre parentesis': '(',
  'abrir paréntesis': '(',
  'abrir parentesis': '(',
  'cierra paréntesis': ')',
  'cierra parentesis': ')',
  'cerrar paréntesis': ')',
  'cerrar parentesis': ')',
  'seno': 'sin(',
  'logaritmo': 'log(',
  'punto': '.',
  'coma': '.',
  'pi': 'pi'
};

/**
 * Procesa números compuestos como "treinta y cinco"
 */
function procesarNumeroCompuesto(palabras, index) {
  let numero = 0;
  let pasos = 0;
  
  const palabra = palabras[index].toLowerCase();
  
  // Verificar decenas
  const decenas = ['treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const valoresDecenas = [30, 40, 50, 60, 70, 80, 90];
  const indexDecena = decenas.indexOf(palabra);
  
  if (indexDecena !== -1) {
    numero = valoresDecenas[indexDecena];
    pasos = 1;
    
    // Verificar si hay "y" seguido de unidades
    if (index + 1 < palabras.length && (palabras[index + 1] === 'y' || palabras[index + 1] === 'i')) {
      if (index + 2 < palabras.length) {
        const unidad = numerosMap[palabras[index + 2].toLowerCase()];
        if (unidad && parseInt(unidad) < 10) {
          numero += parseInt(unidad);
          pasos = 3;
        }
      }
    }
  }
  
  return { numero: numero > 0 ? numero.toString() : null, pasos };
}

/**
 * Convierte texto en español a expresión matemática
 * @param {string} texto - Texto reconocido por voz
 * @returns {string} - Expresión matemática
 */
export function convertirVozAMatematica(texto) {
  if (!texto || typeof texto !== 'string') {
    return '';
  }
  
  // Normalizar el texto
  let textoNormalizado = texto.toLowerCase().trim();
  
  // Si el texto ya contiene símbolos matemáticos, devolverlo directamente
  // Esto maneja casos donde el reconocimiento transcribe "50 + 30"
  if (/[\+\-\*\/\^\(\)=]/.test(textoNormalizado)) {
    console.log('Texto ya contiene símbolos matemáticos, devolviendo directamente:', textoNormalizado);
    return textoNormalizado;
  }
  
  // Eliminar signos de puntuación innecesarios
  textoNormalizado = textoNormalizado.replace(/[¿?¡!,;]/g, '');
  
  // Separar en palabras
  const palabras = textoNormalizado.split(/\s+/);
  
  let expresion = '';
  let i = 0;
  
  while (i < palabras.length) {
    const palabra = palabras[i];
    let convertido = false;
    
    // Verificar números compuestos primero
    const numeroCompuesto = procesarNumeroCompuesto(palabras, i);
    if (numeroCompuesto.numero) {
      expresion += numeroCompuesto.numero;
      i += numeroCompuesto.pasos;
      convertido = true;
      continue;
    }
    
    // Verificar números simples
    if (numerosMap[palabra]) {
      expresion += numerosMap[palabra];
      convertido = true;
    }
    // Verificar operadores
    else if (operadoresMap[palabra]) {
      // Agregar espacios alrededor de operadores para mejor legibilidad
      expresion += ' ' + operadoresMap[palabra] + ' ';
      convertido = true;
    }
    // Verificar funciones
    else if (funcionesMap[palabra]) {
      expresion += funcionesMap[palabra];
      convertido = true;
    }
    // Verificar si es un dígito directo
    else if (/^\d+$/.test(palabra)) {
      expresion += palabra;
      convertido = true;
    }
    // Verificar si contiene símbolos matemáticos
    else if (/[\+\-\*\/\^]/.test(palabra)) {
      expresion += ' ' + palabra + ' ';
      convertido = true;
    }
    
    // Si no se pudo convertir, ignorar la palabra
    // (palabras como "y", "de", "a", "al", "la", etc.)
    
    i++;
  }
  
  // Limpiar espacios múltiples y espacios al inicio/final
  expresion = expresion.replace(/\s+/g, ' ').trim();
  
  // Eliminar espacios antes de paréntesis de cierre y después de apertura
  expresion = expresion.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  
  return expresion;
}

/**
 * Valida si el texto contiene palabras reconocibles
 * @param {string} texto - Texto a validar
 * @returns {boolean} - True si contiene al menos una palabra matemática
 */
export function esTextoMatematico(texto) {
  if (!texto || typeof texto !== 'string') {
    return false;
  }
  
  const textoLower = texto.toLowerCase();
  
  // Verificar si contiene números
  for (const numero in numerosMap) {
    if (textoLower.includes(numero)) {
      return true;
    }
  }
  
  // Verificar si contiene operadores
  for (const operador in operadoresMap) {
    if (textoLower.includes(operador)) {
      return true;
    }
  }
  
  // Verificar si contiene dígitos
  if (/\d/.test(texto)) {
    return true;
  }
  
  return false;
}
