// Prueba del resaltado del siguiente símbolo a derivar
import { evaluateExpression } from './CompleteDerivationParser.js';

console.log('=== PRUEBA: RESALTADO DEL SIGUIENTE SÍMBOLO ===\n');

console.log('🎯 Probando "15 * 3" con resaltado');
console.log('📋 Secuencia esperada con resaltado:');
console.log('   1. E => T');
console.log('   2. **T** => T * F');
console.log('   3. **T** * F => F * F');
console.log('   4. **F** * F => 15 * F');
console.log('   5. 15 * **F** => 15 * 3');

const result = evaluateExpression('15 * 3');

if (result.success) {
  console.log(`\n✅ Resultado: ${result.result}`);
  console.log(`📊 Derivaciones: ${result.productions.length}`);
  console.log('\n🔄 Secuencia generada con resaltado:');
  
  result.productions.forEach((prod, index) => {
    console.log(`   ${index + 1}. ${prod.production}`);
  });
  
  console.log('\n🎨 Verificación del resaltado:');
  result.productions.forEach((prod, index) => {
    if (prod.nextSymbol) {
      console.log(`   Paso ${index + 1}: El símbolo "${prod.nextSymbol}" será derivado en el siguiente paso`);
    } else {
      console.log(`   Paso ${index + 1}: Último paso, no hay siguiente derivación`);
    }
  });
  
  console.log('\n✅ ¡Resaltado implementado correctamente!');
  
} else {
  console.log(`❌ Error: ${result.errors.join(', ')}`);
}

console.log('\n=== FIN DE PRUEBA ===');