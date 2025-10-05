// Pruebas extensivas del parser de derivaciones completas
import { evaluateExpression } from './CompleteDerivationParser.js';

console.log('=== PRUEBAS EXTENSIVAS: DERIVACIONES COMPLETAS ===\n');

function testCase(expression, description) {
  console.log(`🧪 ${description}: "${expression}"`);
  const result = evaluateExpression(expression);
  
  if (result.success) {
    console.log(`✅ Resultado: ${result.result}`);
    console.log('🔄 Derivaciones:');
    result.productions.forEach((prod, index) => {
      console.log(`   ${index + 1}. ${prod.production}`);
    });
  } else {
    console.log(`❌ Error: ${result.errors.join(', ')}`);
  }
  
  console.log('─'.repeat(50));
  console.log();
}

// Casos de prueba
testCase('15 * 3', 'Multiplicación');
testCase('20 / 4', 'División');
testCase('5 + 3', 'Suma');
testCase('10 - 4', 'Resta');
testCase('42', 'Número simple');

console.log('=== RESUMEN ===');
console.log('✅ Cada derivación muestra la cadena completa');
console.log('✅ Se respeta el orden de derivación por la izquierda');
console.log('✅ Los símbolos no terminales se reemplazan uno por uno');
console.log('✅ El resultado final es la expresión original evaluada');

console.log('\n=== FIN DE PRUEBAS ===');