// src/config/api.config.ts

const isDev = process.env.NODE_ENV === 'development';

// Base API configuration
export const API_CONFIG = {
  BASE_URL: isDev
    ? 'http://localhost:8000/api/'
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

  USERS: {
    // Change from '/api/device-tokens/register/'
    REGISTER_DEVICE: '/device-tokens/register/', // <-- CORRECTED PATH
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

  MATCHING: {
    SWIPE: '/swipe/',
    GET_MATCHES: '/matches/',
    GET_MATCH_COUNT: '/matches/count/',
    GET_DISCOVERY: '/discovery/swipe/',
  },

  MESSAGING: {
    LIST_CONVERSATIONS: 'conversations/',           // No leading slash
    CONVERSATION_MESSAGES: (uuid: string) => `conversations/${uuid}/messages/`,
    MARK_READ: (uuid: string) => `conversations/${uuid}/mark_read/`,
    UNREAD_COUNT: 'conversations/unread_count/',
    SEND_MESSAGE: 'messages/',
    CHECK_COST: 'messages/check_cost/',
  },
  
  WALLET: {
    BALANCE: 'wallet/',
    TRANSACTIONS: 'wallet/transactions/',
    PURCHASE: 'wallet/purchase/',
  },

};

//http://172.16.121.92:8000/api
