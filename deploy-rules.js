#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔥 Desplegando reglas de Firebase...\n');

try {
  // Verificar si Firebase CLI está instalado
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Firebase CLI no está instalado.');
    console.log('📦 Instálalo con: npm install -g firebase-tools');
    process.exit(1);
  }

  // Verificar autenticación
  try {
    execSync('firebase projects:list', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ No estás autenticado en Firebase.');
    console.log('🔐 Ejecuta: firebase login');
    process.exit(1);
  }

  // Desplegar reglas de Firestore
  console.log('📝 Desplegando reglas de Firestore...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Reglas de Firestore desplegadas exitosamente\n');

  // Desplegar reglas de Storage
  console.log('📦 Desplegando reglas de Storage...');
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  console.log('✅ Reglas de Storage desplegadas exitosamente\n');

  console.log('🎉 ¡Todas las reglas se desplegaron correctamente!\n');
  console.log('⚠️  IMPORTANTE: Las nuevas reglas requieren autenticación.');
  console.log('   Solo usuarios autenticados pueden acceder a los datos.');

} catch (error) {
  console.error('\n❌ Error al desplegar las reglas:', error.message);
  process.exit(1);
}
