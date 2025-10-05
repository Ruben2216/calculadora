// Prueba del parser con derivaciones completas
import { evaluateExpression } from './CompleteDerivationParser.js';

console.log('=== PRUEBA: DERIVACIONES CON CADENA COMPLETA ===\n');

console.log('🎯 Probando "15 * 3"');
console.log('📋 Secuencia esperada:');
console.log('   1. E => T');
console.log('   2. T => T * F');
console.log('   3. T * F => F * F');
console.log('   4. F * F => 15 * F');
console.log('   5. 15 * F => 15 * 3');

const result = evaluateExpression('15 * 3');

if (result.success) {
  console.log(`\n✅ Resultado: ${result.result}`);
  console.log(`📊 Derivaciones: ${result.productions.length}`);
  console.log('\n🔄 Secuencia generada:');
  
  result.productions.forEach((prod, index) => {
    console.log(`   ${index + 1}. ${prod.production}`);
  });
  
  // Verificar si coincide exactamente
  const expected = [
    'E => T',
    'T => T * F',
    'T * F => F * F',
    'F * F => 15 * F',
    '15 * F => 15 * 3'
  ];
  
  let matches = true;
  console.log('\n🔍 Verificación:');
  
  for (let i = 0; i < expected.length; i++) {
    const actual = result.productions[i]?.production;
    const isMatch = actual === expected[i];
    const status = isMatch ? '✅' : '❌';
    
    console.log(`   ${status} Esperado: "${expected[i]}" | Obtenido: "${actual}"`);
    
    if (!isMatch) {
      matches = false;
    }
  }
  
  console.log(`\n🏆 ${matches ? 'PERFECTO! DERIVACIONES CORRECTAS ✅' : 'TODAVÍA HAY ERRORES ❌'}`);
  
} else {
  console.log(`❌ Error: ${result.errors.join(', ')}`);
}

console.log('\n=== FIN DE PRUEBA ===');