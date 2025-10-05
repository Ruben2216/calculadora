// Prueba del parser leftmost correcto
// Verifica que 15*3/16 genere obligatoriamente T / F

import { evaluateExpression } from './CorrectLeftmostParser.js';

function testCorrectDerivations() {
  console.log('=== PRUEBA DE DERIVACIONES LEFTMOST CORRECTAS ===\n');
  
  // Prueba 1: 15*3/16 - DEBE generar T / F obligatoriamente
  console.log('Prueba 1: 15*3/16');
  console.log('Resultado esperado: 45/16 = 2.8125');
  const result1 = evaluateExpression('15*3/16');
  console.log('Éxito:', result1.success);
  console.log('Resultado:', result1.result);
  console.log('Derivaciones:');
  
  if (result1.derivations) {
    result1.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
    
    // Verificar que existe T / F
    const hasTDivF = result1.derivations.some(d => d.production.includes('T / F'));
    console.log('\n✓ ¿Contiene "T / F"?', hasTDivF ? 'SÍ' : 'NO - ERROR');
  }
  console.log('');
  
  // Prueba 2: 15*3 (caso simple)
  console.log('Prueba 2: 15*3');
  console.log('Resultado esperado: 45');
  const result2 = evaluateExpression('15*3');
  console.log('Éxito:', result2.success);
  console.log('Resultado:', result2.result);
  console.log('Derivaciones:');
  if (result2.derivations) {
    result2.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
  }
  console.log('');
  
  // Prueba 3: 5+3 (suma)
  console.log('Prueba 3: 5+3');
  console.log('Resultado esperado: 8');
  const result3 = evaluateExpression('5+3');
  console.log('Éxito:', result3.success);
  console.log('Resultado:', result3.result);
  console.log('Derivaciones:');
  if (result3.derivations) {
    result3.derivations.forEach((deriv, index) => {
      console.log(`  ${index + 1}. ${deriv.production}`);
    });
  }
  console.log('');
}

export { testCorrectDerivations };

// Para ejecutar: import('./TestCorrectDerivations.js').then(m => m.testCorrectDerivations())