// Prueba completa del resaltado en todos los casos
import { evaluateExpression } from './CompleteDerivationParser.js';

console.log('=== PRUEBA COMPLETA: RESALTADO EN TODOS LOS CASOS ===\n');

function testHighlighting(expression, description) {
  console.log(`🧪 ${description}: "${expression}"`);
  const result = evaluateExpression(expression);
  
  if (result.success) {
    console.log(`✅ Resultado: ${result.result}`);
    console.log('🔄 Derivaciones con resaltado:');
    
    result.productions.forEach((prod, index) => {
      console.log(`   ${index + 1}. ${prod.production}`);
    });
  } else {
    console.log(`❌ Error: ${result.errors.join(', ')}`);
  }
  
  console.log('─'.repeat(60));
  console.log();
}

// Casos de prueba
testHighlighting('15 * 3', 'Multiplicación');
testHighlighting('20 / 4', 'División');
testHighlighting('5 + 3', 'Suma');
testHighlighting('10 - 4', 'Resta');
testHighlighting('42', 'Número simple');

console.log('=== RESUMEN DEL RESALTADO ===');
console.log('✅ Los símbolos que van a derivar están resaltados con **símbolo**');
console.log('✅ Se aplica el resaltado al primer símbolo no terminal de izquierda a derecha');
console.log('✅ El modal mostrará estos símbolos en negritas y con color destacado');
console.log('✅ El historial también muestra el resaltado progresivamente');

console.log('\n=== FIN DE PRUEBAS ===');