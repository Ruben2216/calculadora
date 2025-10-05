// Archivo de prueba para validar el sistema de resaltado correcto
// Valida que se resalte el símbolo que SE ESTÁ derivando en cada paso

import { CompleteDerivationParser } from './CompleteDerivationParser.js';

function testHighlighting() {
  console.log('=== PRUEBA DE RESALTADO CORRECTO ===\n');
  
  // Prueba 1: Multiplicación 15 * 3
  console.log('Prueba 1: 15 * 3');
  const parser1 = new CompleteDerivationParser();
  const result1 = parser1.parse('15 * 3');
  console.log('Derivaciones:');
  result1.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  // Prueba 2: Suma 5 + 3
  console.log('Prueba 2: 5 + 3');
  const parser2 = new CompleteDerivationParser();
  const result2 = parser2.parse('5 + 3');
  console.log('Derivaciones:');
  result2.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  // Prueba 3: División 20 / 4
  console.log('Prueba 3: 20 / 4');
  const parser3 = new CompleteDerivationParser();
  const result3 = parser3.parse('20 / 4');
  console.log('Derivaciones:');
  result3.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  // Prueba 4: Número simple 42
  console.log('Prueba 4: 42');
  const parser4 = new CompleteDerivationParser();
  const result4 = parser4.parse('42');
  console.log('Derivaciones:');
  result4.derivations.forEach((deriv, index) => {
    console.log(`  ${index + 1}. ${deriv}`);
  });
  console.log('');
  
  console.log('=== VALIDACIÓN DE FORMATO ===');
  console.log('Cada línea debe mostrar:');
  console.log('- El símbolo en negrita (**símbolo**) es el que SE ESTÁ derivando');
  console.log('- Formato esperado: "derivación_anterior → **símbolo_derivándose** en nueva_derivación"');
  console.log('- Ejemplo: "**E** → T" (E se está derivando a T)');
  console.log('- Ejemplo: "T → **T** * F" (T se está derivando a T * F)');
}

export { testHighlighting };

// Para ejecutar directamente en consola del navegador:
// import('./TestCompleteHighlighting.js').then(module => module.testHighlighting())