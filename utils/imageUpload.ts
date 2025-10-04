import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import { StorageService } from '@/services/firebase';

export interface ImageUploadResult {
  uri: string;
  downloadUrl?: string;
  error?: string;
}

export async function requestImagePermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'Permisos requeridos',
      'Se necesitan permisos para acceder a tus fotos'
    );
    return false;
  }
  
  return true;
}

export async function requestCameraPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'Permisos requeridos',
      'Se necesitan permisos para usar la cámara'
    );
    return false;
  }
  
  return true;
}

export async function pickImageFromLibrary(): Promise<ImageUploadResult | null> {
  const hasPermission = await requestImagePermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return {
      uri: '',
      error: 'Error al seleccionar imagen',
    };
  }
}

export async function takePhoto(): Promise<ImageUploadResult | null> {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return {
      uri: '',
      error: 'Error al tomar foto',
    };
  }
}

export async function uploadImageToFirebase(
  imageUri: string,
  path: string
): Promise<string> {
  try {
    const downloadUrl = await StorageService.uploadImage(path, imageUri);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw new Error('Error al subir imagen');
  }
}

export function showImagePickerOptions(
  onPickFromLibrary: () => void,
  onTakePhoto: () => void
): void {
  if (Platform.OS === 'web') {
    onPickFromLibrary();
    return;
  }

  Alert.alert(
    'Seleccionar imagen',
    'Elige una opción',
    [
      {
        text: 'Tomar foto',
        onPress: onTakePhoto,
      },
      {
        text: 'Elegir de galería',
        onPress: onPickFromLibrary,
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
}

export async function uploadImage(
  imageUri: string,
  folder: string = 'images'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}.jpg`;
    const downloadUrl = await StorageService.uploadImage(filename, imageUri);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir imagen');
  }
}
