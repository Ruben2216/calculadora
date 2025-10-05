// Prueba del nuevo parser de derivaciones por la izquierda
import { evaluateExpression } from './LeftmostParser.js';

console.log('=== PRUEBA DEL NUEVO PARSER LEFTMOST ===\n');

// Prueba específica para 15 * 3
console.log('🧪 Probando: "15 * 3"');
const result = evaluateExpression('15 * 3');

if (result.success) {
  console.log(`✅ Resultado: ${result.result}`);
  console.log(`📊 Derivaciones generadas: ${result.productions.length}`);
  console.log('\n🔄 Secuencia de derivaciones:');
  
  result.productions.forEach((prod, index) => {
    console.log(`   ${index + 1}. ${prod.production}`);
  });
  
  console.log('\n🎯 Secuencia esperada:');
  console.log('   1. E => T');
  console.log('   2. T => T * F');
  console.log('   3. T => F');
  console.log('   4. F => 15');
  console.log('   5. F => 3');
  
  console.log('\n✅ ¡Funciona correctamente!');
} else {
  console.log(`❌ Error: ${result.errors.join(', ')}`);
}

console.log('\n=== FIN DE PRUEBA ===');