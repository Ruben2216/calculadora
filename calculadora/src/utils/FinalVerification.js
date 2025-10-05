// Verificación final de derivaciones por la izquierda
import { evaluateExpression } from './LeftmostParser.js';

console.log('=== VERIFICACIÓN FINAL: DERIVACIONES POR LA IZQUIERDA ===\n');

console.log('🎯 Probando el ejemplo específico: "15 * 3"');
console.log('📋 Secuencia esperada según tu especificación:');
console.log('   1. E => T');
console.log('   2. T => T * F');
console.log('   3. T => F');
console.log('   4. F => 15');
console.log('   5. F => 3');

const result = evaluateExpression('15 * 3');

if (result.success) {
  console.log(`\n✅ Resultado matemático: ${result.result}`);
  console.log(`📊 Derivaciones generadas: ${result.productions.length}`);
  console.log('\n🔄 Secuencia generada por el parser:');
  
  result.productions.forEach((prod, index) => {
    console.log(`   ${index + 1}. ${prod.production}`);
  });
  
  // Verificar si coincide exactamente
  const expected = [
    'E => T',
    'T => T * F',
    'T => F',
    'F => 15',
    'F => 3'
  ];
  
  let matches = true;
  console.log('\n🔍 Verificación paso a paso:');
  
  for (let i = 0; i < expected.length; i++) {
    const actual = result.productions[i]?.production;
    const isMatch = actual === expected[i];
    const status = isMatch ? '✅' : '❌';
    
    console.log(`   ${status} Paso ${i + 1}: Esperado "${expected[i]}" | Obtenido "${actual}"`);
    
    if (!isMatch) {
      matches = false;
    }
  }
  
  console.log(`\n🏆 Resultado final: ${matches ? 'DERIVACIONES CORRECTAS ✅' : 'DERIVACIONES INCORRECTAS ❌'}`);
  
  if (matches) {
    console.log('\n🎉 ¡El parser ahora genera derivaciones POR LA IZQUIERDA correctamente!');
    console.log('📝 Cada productor se deriva de izquierda a derecha como especificaste.');
  }
  
} else {
  console.log(`❌ Error: ${result.errors.join(', ')}`);
}

console.log('\n' + '='.repeat(60));
console.log('RESUMEN: Parser implementado para derivaciones leftmost según gramaticas1.ada');
console.log('='.repeat(60));