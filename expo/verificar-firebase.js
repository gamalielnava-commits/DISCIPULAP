#!/usr/bin/env node

/**
 * Script de Verificación de Firebase
 * 
 * Este script verifica la configuración de Firebase y detecta problemas comunes.
 * 
 * Uso:
 *   node verificar-firebase.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Firebase...\n');

let erroresEncontrados = 0;
let advertencias = 0;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function error(mensaje) {
  console.log(`${colors.red}❌ ERROR: ${mensaje}${colors.reset}`);
  erroresEncontrados++;
}

function advertencia(mensaje) {
  console.log(`${colors.yellow}⚠️  ADVERTENCIA: ${mensaje}${colors.reset}`);
  advertencias++;
}

function exito(mensaje) {
  console.log(`${colors.green}✅ ${mensaje}${colors.reset}`);
}

function info(mensaje) {
  console.log(`${colors.cyan}ℹ️  ${mensaje}${colors.reset}`);
}

function titulo(mensaje) {
  console.log(`\n${colors.blue}━━━ ${mensaje} ━━━${colors.reset}\n`);
}

// 1. Verificar archivo .env
titulo('1. Verificando archivo .env');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  error('No se encontró el archivo .env');
  info('Crea un archivo .env basado en .env.example');
} else {
  exito('Archivo .env encontrado');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`)) {
      exito(`${varName} está configurado`);
    } else {
      error(`${varName} no está configurado o está vacío`);
    }
  });
}

// 2. Verificar firebaseConfig.ts
titulo('2. Verificando firebaseConfig.ts');

const firebaseConfigPath = path.join(__dirname, 'firebaseConfig.ts');
if (!fs.existsSync(firebaseConfigPath)) {
  error('No se encontró el archivo firebaseConfig.ts');
} else {
  exito('Archivo firebaseConfig.ts encontrado');
  
  const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  if (configContent.includes('apiKey:') && configContent.includes('projectId:')) {
    exito('Configuración de Firebase parece correcta');
  } else {
    error('La configuración de Firebase parece incompleta');
  }
  
  if (configContent.includes('IS_FIREBASE_CONFIGURED')) {
    exito('Variable IS_FIREBASE_CONFIGURED está definida');
  } else {
    advertencia('Variable IS_FIREBASE_CONFIGURED no encontrada');
  }
}

// 3. Verificar reglas de Firestore
titulo('3. Verificando firestore.rules');

const firestoreRulesPath = path.join(__dirname, 'firestore.rules');
if (!fs.existsSync(firestoreRulesPath)) {
  error('No se encontró el archivo firestore.rules');
} else {
  exito('Archivo firestore.rules encontrado');
  
  const rulesContent = fs.readFileSync(firestoreRulesPath, 'utf8');
  
  if (rulesContent.includes('allow create:') && rulesContent.includes('allow update:')) {
    exito('Las reglas tienen permisos separados (create, update)');
  } else {
    advertencia('Las reglas no tienen permisos separados');
    info('Considera separar los permisos en create, update, delete');
  }
  
  if (rulesContent.includes('match /users/{userId}')) {
    exito('Reglas para colección users encontradas');
  } else {
    error('No se encontraron reglas para la colección users');
  }
}

// 4. Verificar reglas de Storage
titulo('4. Verificando storage.rules');

const storageRulesPath = path.join(__dirname, 'storage.rules');
if (!fs.existsSync(storageRulesPath)) {
  error('No se encontró el archivo storage.rules');
} else {
  exito('Archivo storage.rules encontrado');
  
  const storageContent = fs.readFileSync(storageRulesPath, 'utf8');
  
  if (storageContent.includes('isAuthenticated()')) {
    exito('Las reglas de storage requieren autenticación');
  } else {
    advertencia('Las reglas de storage podrían ser muy permisivas');
  }
}

// 5. Verificar firebase.json
titulo('5. Verificando firebase.json');

const firebaseJsonPath = path.join(__dirname, 'firebase.json');
if (!fs.existsSync(firebaseJsonPath)) {
  advertencia('No se encontró el archivo firebase.json');
  info('Este archivo es necesario para desplegar con Firebase CLI');
} else {
  exito('Archivo firebase.json encontrado');
  
  try {
    const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    
    if (firebaseJson.firestore && firebaseJson.firestore.rules) {
      exito(`Reglas de Firestore configuradas: ${firebaseJson.firestore.rules}`);
    } else {
      error('Configuración de Firestore no encontrada en firebase.json');
    }
    
    if (firebaseJson.storage && firebaseJson.storage.rules) {
      exito(`Reglas de Storage configuradas: ${firebaseJson.storage.rules}`);
    } else {
      error('Configuración de Storage no encontrada en firebase.json');
    }
  } catch (e) {
    error('Error al parsear firebase.json: ' + e.message);
  }
}

// 6. Verificar hooks/useFirebaseAuth.ts
titulo('6. Verificando hooks/useFirebaseAuth.ts');

const authHookPath = path.join(__dirname, 'hooks', 'useFirebaseAuth.ts');
if (!fs.existsSync(authHookPath)) {
  error('No se encontró el archivo hooks/useFirebaseAuth.ts');
} else {
  exito('Archivo hooks/useFirebaseAuth.ts encontrado');
  
  const authContent = fs.readFileSync(authHookPath, 'utf8');
  
  if (authContent.includes('auth/operation-not-allowed')) {
    exito('Manejo de error auth/operation-not-allowed implementado');
  } else {
    advertencia('No se encontró manejo específico para auth/operation-not-allowed');
  }
  
  if (authContent.includes('auth/email-already-in-use')) {
    exito('Manejo de error auth/email-already-in-use implementado');
  } else {
    advertencia('No se encontró manejo específico para auth/email-already-in-use');
  }
}

// 7. Verificar services/firebase.ts
titulo('7. Verificando services/firebase.ts');

const firebaseServicePath = path.join(__dirname, 'services', 'firebase.ts');
if (!fs.existsSync(firebaseServicePath)) {
  error('No se encontró el archivo services/firebase.ts');
} else {
  exito('Archivo services/firebase.ts encontrado');
  
  const serviceContent = fs.readFileSync(firebaseServicePath, 'utf8');
  
  if (serviceContent.includes('REQUIRE_EMAIL_VERIFICATION')) {
    const requireVerification = serviceContent.includes('REQUIRE_EMAIL_VERIFICATION = true');
    if (requireVerification) {
      advertencia('La verificación de email está habilitada');
      info('Esto puede causar problemas durante el desarrollo');
    } else {
      exito('La verificación de email está deshabilitada (correcto para desarrollo)');
    }
  }
  
  if (serviceContent.includes('signUp') && serviceContent.includes('signIn')) {
    exito('Métodos de autenticación (signUp, signIn) encontrados');
  } else {
    error('Métodos de autenticación no encontrados');
  }
}

// 8. Verificar package.json
titulo('8. Verificando dependencias');

const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  error('No se encontró el archivo package.json');
} else {
  exito('Archivo package.json encontrado');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'firebase',
      'expo',
      'react-native',
    ];
    
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        exito(`${dep} instalado (${dependencies[dep]})`);
      } else {
        error(`${dep} no está instalado`);
      }
    });
  } catch (e) {
    error('Error al parsear package.json: ' + e.message);
  }
}

// Resumen final
titulo('Resumen');

console.log(`Total de errores: ${colors.red}${erroresEncontrados}${colors.reset}`);
console.log(`Total de advertencias: ${colors.yellow}${advertencias}${colors.reset}`);

if (erroresEncontrados === 0 && advertencias === 0) {
  console.log(`\n${colors.green}🎉 ¡Todo parece estar configurado correctamente!${colors.reset}\n`);
  console.log('Próximos pasos:');
  console.log('1. Verifica que Email/Password esté habilitado en Firebase Console');
  console.log('2. Despliega las reglas: firebase deploy --only firestore:rules,storage');
  console.log('3. Prueba el registro de un nuevo usuario\n');
} else if (erroresEncontrados === 0) {
  console.log(`\n${colors.yellow}⚠️  Hay algunas advertencias, pero la configuración básica está correcta${colors.reset}\n`);
  console.log('Revisa las advertencias arriba y corrígelas si es necesario.\n');
} else {
  console.log(`\n${colors.red}❌ Se encontraron errores que deben ser corregidos${colors.reset}\n`);
  console.log('Revisa los errores arriba y corrígelos antes de continuar.\n');
  console.log('Consulta GUIA_SOLUCION_REGISTRO.md para más información.\n');
}

// Instrucciones adicionales
titulo('Instrucciones Adicionales');

console.log('📚 Documentación disponible:');
console.log('  - RESUMEN_SOLUCION_RAPIDA.md - Solución rápida en 3 pasos');
console.log('  - GUIA_SOLUCION_REGISTRO.md - Guía completa paso a paso');
console.log('  - ANALISIS_ERRORES_FIREBASE.md - Análisis técnico detallado');
console.log('');
console.log('🔧 Comandos útiles:');
console.log('  - firebase login - Autenticarse en Firebase');
console.log('  - firebase deploy --only firestore:rules - Desplegar reglas de Firestore');
console.log('  - firebase deploy --only storage - Desplegar reglas de Storage');
console.log('  - firebase auth:export users.json - Exportar usuarios');
console.log('');

process.exit(erroresEncontrados > 0 ? 1 : 0);
