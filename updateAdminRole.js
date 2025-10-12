import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyATOSjjO73YgRz80bBUPa4OK0rEBov0mCU',
  authDomain: 'discipulapp-8d99c.firebaseapp.com',
  projectId: 'discipulapp-8d99c',
  storageBucket: 'discipulapp-8d99c.appspot.com',
  messagingSenderId: '144673796951',
  appId: '1:144673796951:web:9cd9e632474fb9dedcc412',
  measurementId: 'G-65VZ57LGFH',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateAdminRole() {
  console.log('🔍 Buscando usuarios administradores...');
  console.log('');
  
  const adminEmails = ['admin@gmail.com', 'admin@discipulapp.com'];
  let foundUsers = 0;
  let updatedUsers = 0;
  
  try {
    const usersRef = collection(db, 'users');
    
    for (const email of adminEmails) {
      console.log(`🔎 Buscando: ${email}`);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`   ⚠️  No encontrado`);
        console.log('');
        continue;
      }
      
      foundUsers++;
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('   ✅ Usuario encontrado:');
      console.log('      ID:', userDoc.id);
      console.log('      Email:', userData.email);
      console.log('      Nombre:', userData.nombre, userData.apellido || '');
      console.log('      Rol actual:', userData.role);
      
      if (userData.role === 'admin') {
        console.log('      ✅ Ya tiene rol de administrador');
        console.log('');
        continue;
      }
      
      console.log('      🔄 Actualizando rol a administrador...');
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date()
      });
      
      updatedUsers++;
      console.log('      ✅ Rol actualizado exitosamente');
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Resumen:');
    console.log(`   Usuarios encontrados: ${foundUsers}`);
    console.log(`   Usuarios actualizados: ${updatedUsers}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (foundUsers === 0) {
      console.log('');
      console.log('❌ No se encontraron usuarios administradores');
      console.log('💡 Opciones:');
      console.log('   1. Ejecuta: node createAdmin.js');
      console.log('   2. Regístrate en la app con uno de estos emails:');
      console.log('      - admin@gmail.com');
      console.log('      - admin@discipulapp.com');
    } else if (updatedUsers > 0) {
      console.log('');
      console.log('✅ ¡Listo! Ahora puedes iniciar sesión con permisos de administrador');
      console.log('🔐 Cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto');
    } else {
      console.log('');
      console.log('✅ Todos los administradores ya tienen el rol correcto');
    }
    
  } catch (error) {
    console.error('❌ Error al actualizar el rol:', error.message);
    console.error('💡 Asegúrate de que:');
    console.error('   1. Firebase está configurado correctamente');
    console.error('   2. Las reglas de Firestore permiten la actualización');
    console.error('   3. Tienes conexión a internet');
  }
}

updateAdminRole();
