import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import i18n from '../i18n';

// Resolução inteligente do IP do backend:
// 1. No Expo Go / Celular físico: usa o IP do host do Metro (ex: 192.168.15.3:3333)
// 2. No emulador Android: 10.0.2.2:3333
// URL de Produção no Heroku:
const PRODUCTION_API_URL: string | null = 'https://healthy-routine-api-2aed84e7d72c.herokuapp.com/api/v1';

const getBaseUrl = () => {
  if (PRODUCTION_API_URL) {
    return PRODUCTION_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3333/api/v1';
  }

  // Detecta o IP do computador na rede local via Expo Constants no Expo Go
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3333/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://192.168.15.3:3333/api/v1';
  }

  return 'http://localhost:3333/api/v1';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// Helper de tradução universal de códigos de erro da API
export const getErrorMessage = (error: any): string => {
  if (!error.response) {
    return i18n.t('apiErrors.NETWORK_ERROR');
  }

  const errorCode = error.response?.data?.error;
  if (errorCode && i18n.exists(`apiErrors.${errorCode}`)) {
    return i18n.t(`apiErrors.${errorCode}`);
  }

  return error.response?.data?.message || i18n.t('apiErrors.GENERIC_ERROR');
};

// Interceptor para injetar JWT Token automaticamente
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@healthy_routine_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error fetching token from storage', err);
  }
  return config;
});

// Interceptor de Resposta para tratamento de erro 401 e formatação amigável
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@healthy_routine_token');
      await AsyncStorage.removeItem('@healthy_routine_user');
    }
    error.translatedMessage = getErrorMessage(error);
    return Promise.reject(error);
  }
);
