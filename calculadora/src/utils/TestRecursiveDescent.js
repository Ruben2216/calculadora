// Archivo de prueba para el nuevo parser recursivo descendente
// Prueba expresiones complejas como 15*16/3

import { evaluateExpression } from './RecursiveDescentParser.js';

function testComplexExpressions() {
  console.log('=== PRUEBA DE EXPRESIONES COMPLEJAS ===\n');
  
  // Prueba 1: Multiplicación y división: 15*16/3
  console.log('Prueba 1: 15*16/3');
  console.log('Resultado esperado:', 15*16/3, '= 80');
  const result1 = evaluateExpression('15*16/3');
  console.log('Éxito:', result1.success);
  console.log('Resultado:', result1.result);
  console.log('Derivaciones:');
  result1.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  if (result1.errors.length > 0) {
    console.log('Errores:', result1.errors);
  }
  console.log('');
  
  // Prueba 2: Solo multiplicación: 15*3
  console.log('Prueba 2: 15*3');
  console.log('Resultado esperado:', 15*3, '= 45');
  const result2 = evaluateExpression('15*3');
  console.log('Éxito:', result2.success);
  console.log('Resultado:', result2.result);
  console.log('Derivaciones:');
  result2.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  // Prueba 3: Suma y multiplicación: 5+3*2
  console.log('Prueba 3: 5+3*2');
  console.log('Resultado esperado:', 5+3*2, '= 11');
  const result3 = evaluateExpression('5+3*2');
  console.log('Éxito:', result3.success);
  console.log('Resultado:', result3.result);
  console.log('Derivaciones:');
  result3.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  // Prueba 4: Con paréntesis: (5+3)*2
  console.log('Prueba 4: (5+3)*2');
  console.log('Resultado esperado:', (5+3)*2, '= 16');
  const result4 = evaluateExpression('(5+3)*2');
  console.log('Éxito:', result4.success);
  console.log('Resultado:', result4.result);
  console.log('Derivaciones:');
  result4.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  // Prueba 5: Expresión compleja: 10+5*2-3/1
  console.log('Prueba 5: 10+5*2-3/1');
  console.log('Resultado esperado:', 10+5*2-3/1, '= 17');
  const result5 = evaluateExpression('10+5*2-3/1');
  console.log('Éxito:', result5.success);
  console.log('Resultado:', result5.result);
  console.log('Derivaciones:');
  result5.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
}

export { testComplexExpressions };

// Para ejecutar directamente en consola del navegador:
// import('./TestRecursiveDescent.js').then(module => module.testComplexExpressions())