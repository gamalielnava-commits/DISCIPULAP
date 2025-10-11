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
  console.log('🔍 Buscando usuario admin...');
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'admin@discipulapp.com'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No se encontró el usuario admin@discipulapp.com');
      console.log('💡 Intenta crear el usuario primero con createAdmin.js');
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('✅ Usuario encontrado:');
    console.log('   ID:', userDoc.id);
    console.log('   Email:', userData.email);
    console.log('   Nombre:', userData.nombre);
    console.log('   Rol actual:', userData.role);
    
    if (userData.role === 'admin') {
      console.log('✅ El usuario ya tiene rol de administrador');
      return;
    }
    
    console.log('🔄 Actualizando rol a administrador...');
    const userRef = doc(db, 'users', userDoc.id);
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date()
    });
    
    console.log('✅ Rol actualizado exitosamente a administrador');
    console.log('📧 Email: admin@discipulapp.com');
    console.log('🔑 Contraseña: admin123');
    console.log('👤 Rol: admin');
    
  } catch (error) {
    console.error('❌ Error al actualizar el rol:', error.message);
  }
}

updateAdminRole();
