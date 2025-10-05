// Archivo de pruebas para verificar las derivaciones del ExactParser
import { evaluateExpression } from './ExactParser.js';

console.log('=== INICIANDO PRUEBAS DE DERIVACIONES ===\n');

// Función para ejecutar una prueba
function runTest(testName, expression, expectedSteps) {
  console.log(`🧪 PRUEBA: ${testName}`);
  console.log(`📝 Expresión: "${expression}"`);
  
  try {
    const result = evaluateExpression(expression);
    
    if (result.success) {
      console.log(`✅ Resultado: ${result.result}`);
      console.log(`📊 Derivaciones generadas: ${result.productions.length}`);
      console.log('🔄 Pasos de derivación:');
      
      result.productions.forEach((prod, index) => {
        console.log(`   ${index + 1}. ${prod.production}`);
      });
      
      if (expectedSteps && result.productions.length !== expectedSteps) {
        console.log(`⚠️  ADVERTENCIA: Se esperaban ${expectedSteps} pasos, se obtuvieron ${result.productions.length}`);
      }
    } else {
      console.log(`❌ Error: ${result.errors.join(', ')}`);
    }
    
    console.log('─'.repeat(60) + '\n');
    return result;
    
  } catch (error) {
    console.log(`💥 EXCEPCIÓN: ${error.message}`);
    console.log('─'.repeat(60) + '\n');
    return null;
  }
}

// PRUEBAS BÁSICAS
console.log('🏷️  PRUEBAS BÁSICAS\n');

runTest('Número entero simple', '42', 2);
runTest('Número real simple', '3.14', 2);
runTest('Suma simple', '5 + 3', 4);
runTest('Resta simple', '10 - 4', 4);
runTest('Multiplicación simple', '6 * 7', 4);
runTest('División simple', '20 / 4', 4);

// PRUEBAS INTERMEDIAS
console.log('🏷️  PRUEBAS INTERMEDIAS\n');

runTest('Expresión con paréntesis', '(5 + 3)', 4);
runTest('Múltiples operaciones', '2 + 3 * 4', 6);
runTest('Precedencia de operadores', '10 + 2 * 5', 6);

// PRUEBAS AVANZADAS
console.log('🏷️  PRUEBAS AVANZADAS\n');

runTest('Función seno simple', 'sin(0)', 4);
runTest('Función log simple', 'log(10)', 4);
runTest('Multiplicación con función', '35 * sin(35)', 8);
runTest('Expresión compleja', '2 + sin(10) * 3', 8);

// PRUEBAS DE CASOS EXTREMOS
console.log('🏷️  PRUEBAS DE CASOS EXTREMOS\n');

runTest('Paréntesis anidados', '((5 + 3) * 2)', 6);
runTest('Función con operación interna', 'sin(5 + 10)', 6);
runTest('División por cero', '5 / 0', null);
runTest('Expresión vacía', '', null);

console.log('=== FIN DE PRUEBAS ===');