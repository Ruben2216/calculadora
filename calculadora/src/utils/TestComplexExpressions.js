// Prueba para expresiones complejas con paréntesis
// Verifica: entero * entero + ( entero / entero )

import { evaluateExpression } from './UniversalLeftmostParser.js';

function testComplexExpressions() {
  console.log('=== PRUEBA DE EXPRESIONES COMPLEJAS ===\n');
  
  // Prueba 1: 5*3+(8/2) - expresión con paréntesis
  console.log('Prueba 1: 5*3+(8/2)');
  console.log('Esperado según imagen:');
  console.log('1. E → E + T');
  console.log('2. T → F');  
  console.log('3. F → ( E )');
  console.log('4. E → T');
  console.log('5. E → T');
  console.log('6. T → T * F');
  console.log('7. T → T / F');
  console.log('8. T → F');
  console.log('9. T → F');
  console.log('10-13. F → entero (4 veces)');
  console.log('');
  
  const result1 = evaluateExpression('5*3+(8/2)');
  console.log('Resultado:', result1.result);
  console.log('Éxito:', result1.success);
  console.log('Derivaciones:');
  
  if (result1.derivations) {
    result1.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
  }
  
  console.log('Errores:', result1.errors);
  console.log('');
  
  // Prueba 2: Expresión más simple para verificar
  console.log('Prueba 2: 3+5');
  const result2 = evaluateExpression('3+5');
  console.log('Resultado:', result2.result);
  console.log('Éxito:', result2.success);
  console.log('Derivaciones:');
  
  if (result2.derivations) {
    result2.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
  }
  console.log('');
  
  // Prueba 3: Con paréntesis simple
  console.log('Prueba 3: (5+3)');
  const result3 = evaluateExpression('(5+3)');
  console.log('Resultado:', result3.result);
  console.log('Éxito:', result3.success);
  console.log('Derivaciones:');
  
  if (result3.derivations) {
    result3.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
  }
  console.log('');
}

export { testComplexExpressions };

// Para ejecutar: import('./TestComplexExpressions.js').then(m => m.testComplexExpressions())