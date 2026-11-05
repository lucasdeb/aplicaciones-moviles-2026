import { request } from '../services/http';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { isValidImageUpload } from './validators';

export async function pickPhoto(
  source: 'camera' | 'gallery',
  aspect: [number, number] = [4, 3]
): Promise<string | null> {
  if (source === 'camera') {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Falta permiso', 'Necesitamos acceso a la cámara.');
      return null;
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.5,   // la librería comprime sola
    base64: true,   // y devuelve el base64 directo
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) return null;
  const image = `data:image/jpeg;base64,${result.assets[0].base64}`;
  if (!isValidImageUpload(image)) {
    Alert.alert('Foto demasiado grande', 'Probá con otra foto o recortala un poco más.');
    return null;
  }
  const uploaded = await request('/uploads', 'POST', { image });
  return uploaded.url;

}