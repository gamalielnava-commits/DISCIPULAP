/* eslint-disable no-undef */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando reglas de Firestore...\n');

const firebaseRcPath = path.join(__dirname, '.firebaserc');
if (!fs.existsSync(firebaseRcPath)) {
  console.error('❌ Error: No se encontró el archivo .firebaserc');
  console.error('   Asegúrate de estar en el directorio raíz del proyecto.');
  process.exit(1);
}

const firestoreRulesPath = path.join(__dirname, 'firestore.rules');
if (!fs.existsSync(firestoreRulesPath)) {
  console.error('❌ Error: No se encontró el archivo firestore.rules');
  process.exit(1);
}

console.log('📋 Verificando configuración de Firebase...');
try {
  const firebaseRc = JSON.parse(fs.readFileSync(firebaseRcPath, 'utf8'));
  const projectId = firebaseRc.projects?.default;
  
  if (!projectId) {
    console.error('❌ Error: No se encontró el ID del proyecto en .firebaserc');
    process.exit(1);
  }
  
  console.log(`✅ Proyecto: ${projectId}\n`);
} catch (error) {
  console.error('❌ Error al leer .firebaserc:', error.message);
  process.exit(1);
}

console.log('📤 Desplegando reglas de Firestore...');
try {
  execSync('firebase deploy --only firestore:rules', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\n✅ ¡Reglas desplegadas exitosamente!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Ve a la consola de Firebase');
  console.log('   2. Navega a Firestore Database > Reglas');
  console.log('   3. Verifica que las reglas se hayan actualizado');
  console.log('   4. Ejecuta las pruebas de Firebase en la app\n');
} catch (_error) {
  console.error('\n❌ Error al desplegar las reglas');
  console.error('   Asegúrate de:');
  console.error('   1. Tener Firebase CLI instalado (npm install -g firebase-tools)');
  console.error('   2. Estar autenticado (firebase login)');
  console.error('   3. Tener permisos en el proyecto de Firebase\n');
  process.exit(1);
}
