import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
  return `data:image/jpeg;base64,${result.assets[0].base64}`;
}