// src/config/api.config.ts

const isDev = process.env.NODE_ENV === 'development';

// Base API configuration
export const API_CONFIG = {
  BASE_URL: isDev
    ? 'http://localhost:8000/api'
    : 'https://api.yourproductiondomain.com/api',
  TIMEOUT: 5000,
};

// All backend endpoints
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
  },

  INTERESTS : '/interests/',


  PROFILE: {
    ME: '/profile/me/',
    UPDATE: '/profile/update/',
    UPLOAD_PHOTO: '/profile/upload_photo/',
    DELETE_PHOTO: '/profile/delete_photo/',
    ADD_INTEREST: '/profile/add_interest/',
    REMOVE_INTEREST: '/profile/remove_interest/',
  },
};

//http://172.16.121.92:8000/api
