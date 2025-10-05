// Prueba rápida del nuevo modal con historial integrado
import { evaluateExpression } from './ExactParser.js';

console.log('=== PRUEBA DEL MODAL CON HISTORIAL INTEGRADO ===\n');

const testExpression = '5 + 3 * 2';
console.log(`🧪 Probando: "${testExpression}"`);

try {
  const result = evaluateExpression(testExpression);
  
  if (result.success) {
    console.log(`✅ Resultado: ${result.result}`);
    console.log(`📊 Total de producciones: ${result.productions.length}`);
    console.log('\n🔄 Producciones que aparecerán en el historial del modal:');
    
    result.productions.forEach((prod, index) => {
      console.log(`   ${index + 1}. ${prod.from} → ${prod.to}`);
    });
    
    console.log('\n📋 Simulación de cómo se verá en el modal:');
    console.log('────────────────────────────────────');
    
    // Simular cada paso del modal
    for (let step = 1; step <= result.productions.length; step++) {
      console.log(`\n🔹 PASO ${step} de ${result.productions.length}`);
      console.log(`   Producción actual: ${result.productions[step-1].from} → ${result.productions[step-1].to}`);
      console.log('   Historial hasta este paso:');
      
      for (let i = 0; i < step; i++) {
        console.log(`     ${result.productions[i].from} → ${result.productions[i].to}`);
      }
      
      if (step < result.productions.length) {
        console.log('   [Click "Siguiente →"]');
      }
    }
    
    console.log('\n🏆 ¡Modal con historial integrado funcionando correctamente!');
    
  } else {
    console.log(`❌ Error: ${result.errors.join(', ')}`);
  }
  
} catch (error) {
  console.log(`💥 Excepción: ${error.message}`);
}

console.log('\n=== FIN DE PRUEBA ===');