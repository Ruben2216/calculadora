// Prueba específica para verificar derivaciones continuas
// Debe coincidir con el ejemplo: entero * entero / entero

import { evaluateExpression } from './CorrectLeftmostParser.js';

function testContinuousDerivations() {
  console.log('=== PRUEBA DE DERIVACIONES CONTINUAS ===\n');
  
  // Prueba: 15*3/16 
  console.log('Prueba: 15*3/16');
  console.log('Derivaciones esperadas según la imagen:');
  console.log('1. E → T');
  console.log('2. T → T / F');
  console.log('3. T → T * F (en T / F)');
  console.log('4. T → F (en T * F / F)');
  console.log('5. F → entero (primer número)');
  console.log('6. F → entero (segundo número)');  
  console.log('7. F → entero (tercer número)');
  console.log('');
  
  const result = evaluateExpression('15*3/16');
  console.log('Resultado:', result.result);
  console.log('Derivaciones generadas:');
  
  if (result.derivations) {
    result.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
  }
  
  console.log('\nErrores:', result.errors);
  
  // Verificar resultado matemático
  const expectedResult = 15 * 3 / 16; // = 2.8125
  console.log(`\nResultado esperado: ${expectedResult}`);
  console.log(`Resultado obtenido: ${result.result}`);
  console.log(`¿Correcto?: ${Math.abs(result.result - expectedResult) < 0.0001 ? 'SÍ' : 'NO'}`);
}

export { testContinuousDerivations };

// Para ejecutar: import('./TestContinuous.js').then(m => m.testContinuousDerivations())