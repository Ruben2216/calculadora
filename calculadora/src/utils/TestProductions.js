// Prueba rápida del parser para verificar formato de derivaciones

import { evaluateExpression } from './ComplexExpressionParser.js';

function testProductions() {
  console.log('=== PRUEBA DE FORMATO DE PRODUCCIONES ===\n');
  
  // Prueba simple
  console.log('Prueba: 15/9');
  const result = evaluateExpression('15/9');
  console.log('Éxito:', result.success);
  console.log('Resultado:', result.result);
  console.log('Formato de derivaciones:');
  
  if (result.derivations && result.derivations.length > 0) {
    result.derivations.forEach((deriv, index) => {
      console.log(`${index + 1}.`, {
        step: deriv.step,
        from: deriv.from,
        fromHighlighted: deriv.fromHighlighted,
        to: deriv.to,
        production: deriv.production,
        derivingSymbol: deriv.derivingSymbol
      });
    });
  } else {
    console.log('NO HAY DERIVACIONES - PROBLEMA AQUÍ');
  }
  
  console.log('\nErrores:', result.errors);
}

export { testProductions };

// Para ejecutar en consola: import('./TestProductions.js').then(m => m.testProductions())