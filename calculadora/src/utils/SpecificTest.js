// Prueba específica para verificar derivaciones complejas
import { evaluateExpression } from './ExactParser.js';

console.log('=== PRUEBA ESPECÍFICA: DERIVACIONES COMPLEJAS ===\n');

// Prueba el caso específico mencionado: "35 * sin(35)"
const testExpression = '35 * sin(35)';
console.log(`🧪 Evaluando: "${testExpression}"`);

try {
  const result = evaluateExpression(testExpression);
  
  if (result.success) {
    console.log(`✅ Resultado: ${result.result}`);
    console.log(`📊 Total de derivaciones: ${result.productions.length}`);
    console.log('\n🔄 Secuencia de derivaciones:');
    
    result.productions.forEach((prod, index) => {
      console.log(`   ${String(index + 1).padStart(2, ' ')}. ${prod.production}`);
    });
    
    // Verificar la secuencia esperada específicamente
    const expectedSequence = [
      'E => T',
      'T => T * F', 
      'F => entero',
      'T => F',
      'F => Seno ( E )',
      'E => T',
      'T => T * F',
      'F => entero'
    ];
    
    console.log('\n🎯 Verificación de secuencia esperada:');
    let sequenceCorrect = true;
    
    expectedSequence.forEach((expected, index) => {
      const actual = result.productions[index]?.production;
      const isCorrect = actual === expected;
      const status = isCorrect ? '✅' : '❌';
      
      console.log(`   ${status} Paso ${index + 1}: Esperado "${expected}" | Obtenido "${actual}"`);
      
      if (!isCorrect) {
        sequenceCorrect = false;
      }
    });
    
    console.log(`\n🏆 Resultado final: ${sequenceCorrect ? 'SECUENCIA CORRECTA ✅' : 'SECUENCIA INCORRECTA ❌'}`);
    
  } else {
    console.log(`❌ Error: ${result.errors.join(', ')}`);
  }
  
} catch (error) {
  console.log(`💥 Excepción: ${error.message}`);
}

console.log('\n=== FIN DE PRUEBA ESPECÍFICA ===');