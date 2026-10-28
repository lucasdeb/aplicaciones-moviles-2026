import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from './jsonStorage';

export const { getJSON, setJSON, remove } = createJSONStorage(AsyncStorage);
