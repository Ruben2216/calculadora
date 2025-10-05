// Pruebas extensivas del parser leftmost
import { evaluateExpression } from './LeftmostParser.js';

console.log('=== PRUEBAS EXTENSIVAS DEL PARSER LEFTMOST ===\n');

function testExpression(expr, expectedSteps) {
  console.log(`🧪 Probando: "${expr}"`);
  const result = evaluateExpression(expr);
  
  if (result.success) {
    console.log(`✅ Resultado: ${result.result}`);
    console.log(`📊 Derivaciones: ${result.productions.length}`);
    
    result.productions.forEach((prod, index) => {
      console.log(`   ${index + 1}. ${prod.production}`);
    });
    
    console.log('─'.repeat(50));
  } else {
    console.log(`❌ Error: ${result.errors.join(', ')}`);
    console.log('─'.repeat(50));
  }
  console.log();
}

// Casos básicos
testExpression('42');
testExpression('15 * 3');
testExpression('20 / 4');

// Casos con suma
testExpression('5 + 3');

console.log('=== FIN DE PRUEBAS ===');